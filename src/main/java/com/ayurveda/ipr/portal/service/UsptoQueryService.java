package com.ayurveda.ipr.portal.service;

import com.ayurveda.ipr.portal.model.UsptoQueryResponse;
import org.springframework.stereotype.Service;

/**
 * Portal 4 Connector: USPTO Patent Public Search (ppubs.uspto.gov).
 * Formulates search queries and provides 35 U.S.C. § 101 subject-matter eligibility
 * guidance under the US "Product of Nature" judicial exclusion doctrine.
 */
@Service
public class UsptoQueryService {

    public UsptoQueryResponse generateUsptoQuery(String botanicalOrKeyword, String ipcOrCpc) {
        String cleanKeyword = botanicalOrKeyword != null ? botanicalOrKeyword.trim() : "Withania";
        String cleanCpc = (ipcOrCpc != null && !ipcOrCpc.trim().isEmpty())
                ? ipcOrCpc.trim().replace(" ", "") + ".cpc."
                : "A61K36/00.cpc.";

        // USPTO Patent Public Search Syntax
        // e.g. ("Withania somnifera" OR "Ashwagandha").ab. AND A61K36/81.cpc.
        String usptoSyntax = String.format("(\"%s\").ab. AND %s", cleanKeyword, cleanCpc);

        String section101Guidance = "35 U.S.C. § 101 Subject-Matter Eligibility Assessment: " +
                "Under US Supreme Court jurisprudence (Ass'n for Molecular Pathology v. Myriad Genetics, 569 U.S. 666 (2013) " +
                "and Diamond v. Chakrabarty, 447 U.S. 303 (1980)), raw botanical extracts, isolated phytochemicals, or " +
                "simple tinctures are classified as non-patentable 'Products of Nature'. An applicant cannot patent a natural " +
                "plant substance merely by purifying or isolating it from its native source.";

        String claimStrategy = "Recommended US Filing Strategy: " +
                "1. Focus claims on 'Markedly Different Characteristics' (e.g. chemically modified functional groups or synthetic analogs). " +
                "2. Claim non-obvious synergistic combinations demonstrating statistical co-operativity (Mayo/Alice Step 2B). " +
                "3. Claim specific Methods of Treatment under 35 U.S.C. § 100(b) (e.g. 'A method of treating osteoarthritis comprising administering a daily dose of X combined with Y'). " +
                "4. Claim proprietary drug delivery platforms (e.g. enteric-coated nano-emulsion with specified dissolution kinetics).";

        return new UsptoQueryResponse(
                cleanKeyword,
                cleanCpc,
                usptoSyntax,
                section101Guidance,
                claimStrategy
        );
    }
}
