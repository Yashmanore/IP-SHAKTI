package com.ayurveda.ipr.classifier;

import com.ayurveda.ipr.classifier.model.ClassificationRequest;
import com.ayurveda.ipr.classifier.model.ClassificationResult;
import com.ayurveda.ipr.classifier.model.ProductCategory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Deterministic Decision Tree Engine implementing:
 * 1. Drugs and Cosmetics Act 1940 & Rules 1945 (Rule 158-B: Classical vs Proprietary vs Cosmetic vs Phytopharmaceutical)
 * 2. Food Safety and Standards (Ayurveda Aahar) Regulations 2022
 * 3. Patents Act 1970 (Section 3(p) TK Bar, Section 3(e) Synergism Bar, Section 2(1)(j) Process Patentability)
 * 4. Biological Diversity Act 2002 (Section 3 vs Section 7, Form I vs SBB Intimation)
 */
@Service
public class Rule158BClassificationEngine {

    private static final List<String> NON_AYUSH_TERMS = List.of(
            "pizza", "hamburger", "burger", "chocolate", "espresso", "rodeo", "french fries", "fries",
            "pasta", "sandwich", "steak", "hotdog", "chips", "soda", "coke", "pepsi", "beer", "whiskey",
            "computer", "software", "microchip", "uranium", "nuclear", "crypto", "nft", "tire", "plastic",
            "diesel", "petrol", "missile", "robot", "quantum"
    );

    private static final List<String> BOTANICAL_INDICATORS = List.of(
            "extract", "herb", "plant", "root", "leaf", "leaves", "bark", "seed", "flower", "fruit",
            "rhizome", "stem", "oil", "churna", "powder", "bhasma", "decoction", "taila", "ghrita",
            "asava", "arishta", "vati", "kwath", "rasayana", "synergy", "phytochemical", "botanical",
            "fraction", "standardized", "aqueous", "ethanolic", "tincture", "capsule", "syrup",
            "withania", "somnifera", "curcuma", "longa", "ocimum", "sanctum", "azadirachta", "indica",
            "emblica", "officinalis", "zingiber", "piper", "nigrum", "longum", "boswellia", "serrata",
            "aloe", "vera", "barbadensis", "bacopa", "monnieri", "terminalia", "arjuna", "chebula",
            "ashwagandha", "turmeric", "haldi", "tulsi", "neem", "amla", "triphala", "brahmi",
            "guggulu", "guggul", "giloy", "mulethi", "licorice", "shatavari", "safed musli",
            "haritaki", "bibhitaki", "shunthi", "sunthi", "maricha", "pippali", "ela", "dalchini",
            "lavang", "clove", "kesar", "saffron", "jaiphal", "nutmeg", "shankhpushpi", "manjistha",
            "chyawanprash", "dashmool", "aushadh", "ayurved"
    );

    public ClassificationResult evaluate(ClassificationRequest req) {
        ClassificationResult res = new ClassificationResult();
        List<String> trace = new ArrayList<>();
        List<String> patentSections = new ArrayList<>();
        List<String> disclaimers = new ArrayList<>();

        // DOMAIN GUARDRAIL 1: Reject explicit non-AYUSH commodities
        String combined = ((req.getProductName() != null ? req.getProductName() : "") + " " +
                (req.getBotanicalIngredients() != null ? String.join(" ", req.getBotanicalIngredients()) : "") + " " +
                (req.getClaimedIndication() != null ? req.getClaimedIndication() : "")).toLowerCase();

        List<String> matchedBlacklist = NON_AYUSH_TERMS.stream().filter(combined::contains).toList();
        if (!matchedBlacklist.isEmpty()) {
            trace.add("Statutory Guardrail: Input contains non-AYUSH commodities [" + String.join(", ", matchedBlacklist) + "].");
            res.setCategory(ProductCategory.OUT_OF_SCOPE);
            res.setCategoryDisplayName("Out of Scope / Non-Ayurvedic Input");
            res.setGoverningAct("Not Applicable");
            res.setLicensingAuthority("Not Applicable");
            res.setLicensingProcedure("Not eligible for AYUSH licensing or Rule 158-B pathways.");
            res.setClinicalTrialRequirement("Not applicable for non-herbal/culinary commodities.");
            disclaimers.add("This product does not qualify under AYUSH or herbal medicine frameworks.");
            res.setFormulationPatentableInIndia(false);
            res.setPatentabilityVerdict("REJECTED: The input items (" + String.join(", ", matchedBlacklist) + ") are culinary or non-botanical commodities outside Ayurvedic Pharmacopoeia (API) and Drugs & Cosmetics Act scope.");
            res.setRecommendedIprStrategy("Protect as standard trademark under Class 29/30/43 or Non-AYUSH patent/trade secret.");
            res.setNbaComplianceStatus("Not applicable.");
            res.setRequiredNbaForm("None");
            res.setDecisionTrace(trace);
            res.setMandatoryLabelDisclaimers(disclaimers);
            res.setRelevantPatentSections(List.of("Not Applicable"));
            return res;
        }

        // DOMAIN GUARDRAIL 2 (POSITIVE VERIFICATION): Product name can be arbitrary, but ingredients MUST be botanical/AYUSH
        if (req.getBotanicalIngredients() != null && !req.getBotanicalIngredients().isEmpty()) {
            String ingrStr = String.join(" ", req.getBotanicalIngredients()).toLowerCase();
            boolean hasBotanical = BOTANICAL_INDICATORS.stream().anyMatch(ingrStr::contains);
            if (!hasBotanical) {
                trace.add("Statutory Guardrail: Formulation ingredients fail positive botanical/AYUSH authentication.");
                res.setCategory(ProductCategory.OUT_OF_SCOPE);
                res.setCategoryDisplayName("Out of Scope / Non-Ayurvedic Input");
                res.setGoverningAct("Not Applicable");
                res.setLicensingAuthority("Not Applicable");
                res.setLicensingProcedure("Not eligible for AYUSH licensing or Rule 158-B pathways.");
                res.setClinicalTrialRequirement("Not applicable for non-herbal commodities.");
                disclaimers.add("The provided ingredients are not recognized as Ayurvedic medicinal plants or classical extracts.");
                res.setFormulationPatentableInIndia(false);
                res.setPatentabilityVerdict("REJECTED: The formulation ingredients are not recognized medicinal herbs, traditional extracts, or biological resources under the Drugs & Cosmetics Act or First Schedule treatises.");
                res.setRecommendedIprStrategy("Protect as standard brand trademark or non-AYUSH patent.");
                res.setNbaComplianceStatus("Not applicable.");
                res.setRequiredNbaForm("None");
                res.setDecisionTrace(trace);
                res.setMandatoryLabelDisclaimers(disclaimers);
                res.setRelevantPatentSections(List.of("Not Applicable"));
                return res;
            }
        }

        trace.add("Step 1: Inspecting primary intended use and formulation origin...");

        // BRANCH 1: AYURVEDIC COSMETIC
        if (req.getIntendedUse() == ClassificationRequest.IntendedUse.COSMETIC_BEAUTY) {
            trace.add("Product primary use is cosmetic/beautification (cleansing, perfuming, aesthetic application).");
            res.setCategory(ProductCategory.AYURVEDIC_COSMETIC);
            res.setCategoryDisplayName(ProductCategory.AYURVEDIC_COSMETIC.getDisplayName());
            res.setGoverningAct(ProductCategory.AYURVEDIC_COSMETIC.getGoverningAct());
            res.setLicensingAuthority(ProductCategory.AYURVEDIC_COSMETIC.getLicensingAuthority());

            res.setLicensingProcedure("Apply for Ayurvedic Cosmetic Manufacturing License under Form 32-A with State AYUSH Licensing Authority.");
            res.setClinicalTrialRequirement("Exempt from systemic clinical trials. Must submit Bureau of Indian Standards (BIS) safety compliance, skin irritation, and heavy metal limits.");
            disclaimers.add("Strictly prohibited from making medicinal or therapeutic disease cure claims on packaging.");

            res.setFormulationPatentableInIndia(false);
            patentSections.add("Section 3(p) - Traditional Knowledge");
            patentSections.add("Section 3(e) - Mere admixture");
            res.setPatentabilityVerdict("Raw botanical cosmetic mixtures are not patentable under Section 3(p). However, novel cosmetic delivery bases, nano-emulsions, or stable lipid carriers are patentable under Section 2(1)(j).");
            res.setRecommendedIprStrategy("Protect brand and packaging aesthetics via Trademark Act 1999 and Designs Act 2000. Patent only novel carrier or extraction processes.");

            applyNbaGuidance(req, res, trace);
            res.setRelevantPatentSections(patentSections);
            res.setMandatoryLabelDisclaimers(disclaimers);
            res.setDecisionTrace(trace);
            return res;
        }

        // BRANCH 2: AYURVEDA AAHAR (FSSAI 2022)
        if (req.getIntendedUse() == ClassificationRequest.IntendedUse.DIETARY_NUTRITION) {
            trace.add("Product primary use is dietary nutrition/supplementation without parenteral/injectable administration.");
            res.setCategory(ProductCategory.AYURVEDA_AAHAR);
            res.setCategoryDisplayName(ProductCategory.AYURVEDA_AAHAR.getDisplayName());
            res.setGoverningAct(ProductCategory.AYURVEDA_AAHAR.getGoverningAct());
            res.setLicensingAuthority(ProductCategory.AYURVEDA_AAHAR.getLicensingAuthority());

            res.setLicensingProcedure("Obtain Central FSSAI License under Food Safety and Standards (Ayurveda Aahar) Regulations, 2022 (NOT under D&C Act drug license).");
            res.setClinicalTrialRequirement("No clinical trials required. Must adhere to FSSAI safety limits for heavy metals (Lead, Cadmium, Arsenic, Mercury), pesticide residues, and microbial count.");
            disclaimers.add("Mandatory to display official 'Ayurveda Aahar' logo on principal display panel.");
            disclaimers.add("Label must state: 'NOT FOR MEDICINAL USE - To be used as food supplement only'.");
            disclaimers.add("Prohibited from claiming prevention or cure of any human disease.");

            res.setFormulationPatentableInIndia(false);
            patentSections.add("Section 3(p) - Traditional Knowledge");
            patentSections.add("Section 3(e) - Substance obtained by mere admixture");
            res.setPatentabilityVerdict("Food formulations based on traditional Ayurvedic dietary recipes are strictly barred under Section 3(p). Only proprietary fortified processing methods can be patented.");
            res.setRecommendedIprStrategy("Register trademark for brand identity. Obtain FSSAI Central License. Rely on trade secrets for proprietary cooking/blending parameters.");

            applyNbaGuidance(req, res, trace);
            res.setRelevantPatentSections(patentSections);
            res.setMandatoryLabelDisclaimers(disclaimers);
            res.setDecisionTrace(trace);
            return res;
        }

        // BRANCH 3: THERAPEUTIC / MEDICINAL
        trace.add("Product has therapeutic or disease mitigation indication (D&C Act Section 3(a)).");

        // Sub-branch: Classical Ayurvedic Formulation
        if (req.isMatchesScheduleIBook() && !req.isFormulaOrRatioModified() && !req.isNewIndicationOrDosageRoute()) {
            trace.add("Exact ingredient formulation, ratio, and dosage route match First Schedule Ayurvedic texts (" 
                    + (req.getScheduleIBookName() != null ? req.getScheduleIBookName() : "Schedule I Book") + ").");
            
            res.setCategory(ProductCategory.CLASSICAL_AYURVEDIC_FORMULATION);
            res.setCategoryDisplayName(ProductCategory.CLASSICAL_AYURVEDIC_FORMULATION.getDisplayName());
            res.setGoverningAct(ProductCategory.CLASSICAL_AYURVEDIC_FORMULATION.getGoverningAct());
            res.setLicensingAuthority(ProductCategory.CLASSICAL_AYURVEDIC_FORMULATION.getLicensingAuthority());

            res.setLicensingProcedure("State AYUSH Licensing Authority issues Form 25-D (Manufacturing License) or Form 24-D (Loan License) under Drugs & Cosmetics Rules.");
            res.setClinicalTrialRequirement("COMPLETELY EXEMPT from clinical trials. Enjoys legal presumption of safety and efficacy based on centuries of documented traditional usage in authoritative texts.");
            disclaimers.add("Must cite the authoritative Ayurvedic treatise name on the carton/label.");

            res.setFormulationPatentableInIndia(false);
            patentSections.add("Section 3(p) - Traditional Knowledge Bar (Absolute)");
            patentSections.add("Section 3(e) - Mere Admixture");
            res.setPatentabilityVerdict("STRICTLY NON-PATENTABLE. Section 3(p) of the Indian Patents Act 1970 explicitly prohibits patenting any traditional formulation already documented in classical scriptures (and indexed in TKDL).");
            res.setRecommendedIprStrategy("Brand Name Trademark Protection (Trade Marks Act 1999). Note: The generic classical name (e.g., 'Chyawanprash', 'Triphala Churna') CANNOT be registered as an exclusive trademark, but your house brand prefix can (e.g., 'BrandX Chyawanprash').");

            applyNbaGuidance(req, res, trace);
            res.setRelevantPatentSections(patentSections);
            res.setMandatoryLabelDisclaimers(disclaimers);
            res.setDecisionTrace(trace);
            return res;
        }

        // Sub-branch: Phytopharmaceutical / Pure Bioactive Extract
        if (req.isPurifiedPhytochemicalExtract()) {
            trace.add("Product contains purified phytochemical fractions / standardized botanical extract.");
            res.setCategory(ProductCategory.NEW_BOTANICAL_OR_PHYTOPHARMACEUTICAL);
            res.setCategoryDisplayName(ProductCategory.NEW_BOTANICAL_OR_PHYTOPHARMACEUTICAL.getDisplayName());
            res.setGoverningAct(ProductCategory.NEW_BOTANICAL_OR_PHYTOPHARMACEUTICAL.getGoverningAct());
            res.setLicensingAuthority(ProductCategory.NEW_BOTANICAL_OR_PHYTOPHARMACEUTICAL.getLicensingAuthority());

            res.setLicensingProcedure("Must apply to CDSCO / DCGI under Rule 122-E of Drugs and Cosmetics Rules for Phytopharmaceutical Drug approval.");
            res.setClinicalTrialRequirement("MANDATORY Phase I, Phase II, and Phase III clinical trials, animal toxicology studies, and fingerprint chromatography validation.");

            res.setFormulationPatentableInIndia(true);
            patentSections.add("Section 2(1)(j) - Patentable Novel Extraction / Composition");
            patentSections.add("Section 3(d) - Must demonstrate significant enhancement of therapeutic efficacy");
            res.setPatentabilityVerdict("PATENTABLE. Standardized bioactive fractions or novel extraction processes are eligible for Indian and PCT international patents, provided enhanced therapeutic efficacy is proven over crude extracts (Section 3(d)).");
            res.setRecommendedIprStrategy("File Indian Patent Application along with Form III approval from National Biodiversity Authority (NBA) under Section 6 of Biological Diversity Act.");

            applyNbaGuidance(req, res, trace);
            res.setRelevantPatentSections(patentSections);
            res.setMandatoryLabelDisclaimers(disclaimers);
            res.setDecisionTrace(trace);
            return res;
        }

        // Sub-branch: Proprietary Ayurvedic Medicine Category B (New Indication or Modified Route)
        if (req.isNewIndicationOrDosageRoute() || req.isFormulaOrRatioModified()) {
            trace.add("Formulation contains classical ingredients, but has altered ratios, new excipients, or new clinical indication.");
            res.setCategory(ProductCategory.PROPRIETARY_AYURVEDIC_MEDICINE_CATEGORY_B);
            res.setCategoryDisplayName(ProductCategory.PROPRIETARY_AYURVEDIC_MEDICINE_CATEGORY_B.getDisplayName());
            res.setGoverningAct(ProductCategory.PROPRIETARY_AYURVEDIC_MEDICINE_CATEGORY_B.getGoverningAct());
            res.setLicensingAuthority(ProductCategory.PROPRIETARY_AYURVEDIC_MEDICINE_CATEGORY_B.getLicensingAuthority());

            res.setLicensingProcedure("Apply for Proprietary Ayurvedic Medicine license with State AYUSH Licensing Authority accompanied by technical committee safety dossier.");
            res.setClinicalTrialRequirement("Rule 158-B(1)(B) requires Pilot Clinical Trials on at least 30 patients, along with acute/sub-acute animal toxicity data.");

            if (req.isSynergisticDataAvailable()) {
                res.setFormulationPatentableInIndia(true);
                patentSections.add("Section 2(1)(j) - Novel Combination with Synergism");
                res.setPatentabilityVerdict("POTENTIALLY PATENTABLE if the modification exhibits proven statistical synergism (non-obvious combined effect exceeding simple addition of parts per Section 3(e)).");
                res.setRecommendedIprStrategy("File patent on the specific synergistic ratio and manufacturing process. Must file Form III with NBA before grant.");
            } else {
                res.setFormulationPatentableInIndia(false);
                patentSections.add("Section 3(e) - Mere admixture objection");
                patentSections.add("Section 3(p) - Known medicinal properties");
                res.setPatentabilityVerdict("HIGH RISK OF REJECTION under Section 3(e) and 3(p) unless comparative laboratory data proving synergistic enhancement is submitted.");
                res.setRecommendedIprStrategy("Obtain Proprietary AYUSH license via Rule 158-B pilot trial data. Protect brand via trademark. Conduct in-vitro synergy assays before filing patent.");
            }

            applyNbaGuidance(req, res, trace);
            res.setRelevantPatentSections(patentSections);
            res.setMandatoryLabelDisclaimers(disclaimers);
            res.setDecisionTrace(trace);
            return res;
        }

        // Sub-branch: Proprietary Ayurvedic Medicine Category A (Standard classical ingredients & indications)
        trace.add("Formulation uses classical ingredients with traditional indications, but proprietary combination.");
        res.setCategory(ProductCategory.PROPRIETARY_AYURVEDIC_MEDICINE_CATEGORY_A);
        res.setCategoryDisplayName(ProductCategory.PROPRIETARY_AYURVEDIC_MEDICINE_CATEGORY_A.getDisplayName());
        res.setGoverningAct(ProductCategory.PROPRIETARY_AYURVEDIC_MEDICINE_CATEGORY_A.getGoverningAct());
        res.setLicensingAuthority(ProductCategory.PROPRIETARY_AYURVEDIC_MEDICINE_CATEGORY_A.getLicensingAuthority());

        res.setLicensingProcedure("Apply for Proprietary Ayurvedic Medicine license under Rule 158-B(1)(A) with State AYUSH Authority.");
        res.setClinicalTrialRequirement("Exempt from full clinical trials. Submission of published authoritative textual references and acute toxicity safety data is sufficient.");

        res.setFormulationPatentableInIndia(false);
        patentSections.add("Section 3(p) - Traditional Knowledge");
        patentSections.add("Section 3(e) - Mere admixture");
        res.setPatentabilityVerdict("Formula composition barred under Section 3(p) and Section 3(e). Patentable only if novel drug delivery mechanism (NDDS) or proprietary extraction method is claimed.");
        res.setRecommendedIprStrategy("Protect formulation as Proprietary Ayurvedic Medicine. Secure Trademark for brand name. Consider patenting extraction/purification method if novel.");

        applyNbaGuidance(req, res, trace);
        res.setRelevantPatentSections(patentSections);
        res.setMandatoryLabelDisclaimers(disclaimers);
        res.setDecisionTrace(trace);
        return res;
    }

    /**
     * Applies statutory Biological Diversity Act, 2002 rules:
     * - Foreign entity / NRI / foreign-controlled company -> Section 3 (Mandatory Form I prior approval before access)
     * - Indian citizen / Indian entity -> Section 7 (Intimation to State Biodiversity Board - SBB)
     * - Patent filing on Indian bio-resources -> Section 6 (Form III approval prior to patent grant)
     */
    private void applyNbaGuidance(ClassificationRequest req, ClassificationResult res, List<String> trace) {
        if (req.getApplicantType() == ClassificationRequest.EntityType.FOREIGN_ENTITY_OR_NRI) {
            trace.add("Applicant is a Foreign Entity or NRI: Governed strictly under Section 3 of Biological Diversity Act 2002.");
            res.setNbaComplianceStatus("MANDATORY PRIOR APPROVAL REQUIRED (Section 3). Criminal penalties apply for accessing Indian biological resources without NBA approval.");
            res.setRequiredNbaForm("NBA Form I (Application for Access to Biological Resources and Associated Traditional Knowledge)");
        } else {
            trace.add("Applicant is an Indian citizen/registered Indian entity: Governed under Section 7 of Biological Diversity Act 2002.");
            if (req.isCommercialUtilization()) {
                res.setNbaComplianceStatus("Prior Intimation to State Biodiversity Board (SBB) required under Section 7 for commercial utilization. Exemption applies only to local vaids/hakims.");
                res.setRequiredNbaForm("SBB Form (Prior Intimation to State Biodiversity Board under Section 7)");
            } else {
                res.setNbaComplianceStatus("Research exemption may apply under Section 5 if purely non-commercial, but commercialization triggers Section 7 intimation.");
                res.setRequiredNbaForm("None during pure laboratory research; SBB intimation mandatory prior to commercial production.");
            }
        }
    }
}
