package com.ayurveda.ipr.multilingual;

import com.ayurveda.ipr.chat.model.ChatMessageResponse;
import com.ayurveda.ipr.chat.model.ClarificationOption;
import com.ayurveda.ipr.chat.model.ClarificationPrompt;
import com.ayurveda.ipr.chat.model.FivePillarsResponse;
import com.ayurveda.ipr.multilingual.model.Language;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Native Multilingual Engine providing Hindi (हिन्दी) and Marathi (मराठी) support
 * for Ayurvedic vaidyas, grassroots MSMEs, and farmers under the SIH mandate.
 *
 * Provides:
 * 1. Fast script & lexical language detection (Devanagari Hindi vs Marathi vs English).
 * 2. Cross-lingual query normalization to English for pgvector & BM25 hybrid search.
 * 3. Authoritative Devanagari legal response synthesis preserving statutory sections intact.
 */
@Service
public class MultilingualTranslationService {

    private static final Logger log = LoggerFactory.getLogger(MultilingualTranslationService.class);

    // Devanagari Unicode Block: \u0900 - \u097F
    private static final Pattern DEVANAGARI_PATTERN = Pattern.compile("[\\u0900-\\u097F]");

    // Distinctive Marathi Lexical Markers & Postpositions
    private static final Set<String> MARATHI_MARKERS = Set.of(
            "आहे", "नाही", "नाहीत", "शकेल", "शकता", "माझ्या", "माझे", "करावे", "करणे", "झाले",
            "काय", "मिळेल", "अर्क", "औषध", "नोंदणी", "कलम", "नियम", "अधिकार", "शेतकरी", "वनस्पती",
            "संदर्भ", "घटक", "प्रक्रिया", "केले", "मिळू", "शकते", "हवे", "आहेत", "कशा", "कसे",
            "च्या", "साठी", "नुसार", "कोणता", "कोणते", "कोणती", "लागेल", "भरावा", "करावा", "असेल",
            "हळद", "हळदीच्या", "अर्कासाठी", "कसा", "कशी", "पाहिजे", "दिले", "मिळण्यासाठी", "घेणे"
    );

    // Distinctive Hindi Lexical Markers
    private static final Set<String> HINDI_MARKERS = Set.of(
            "है", "नहीं", "सकता", "सकती", "सकते", "मेरा", "मेरी", "मेरे", "करना", "होगा", "होगी",
            "क्या", "मिलेगा", "मिलेगी", "दवा", "पंजीकरण", "धारा", "नियम", "अधिकार", "किसान", "पौधा",
            "संदर्भ", "घटक", "प्रक्रिया", "किया", "सकें", "चाहिए", "हैं", "कैसे", "किस"
    );

    // Plant translations from Devanagari to English botanical terms
    private static final Map<String, String> PLANT_TRANSLATIONS = new LinkedHashMap<>();
    static {
        PLANT_TRANSLATIONS.put("अश्वगंधा", "Ashwagandha (Withania somnifera)");
        PLANT_TRANSLATIONS.put("हळद", "Haridra Turmeric (Curcuma longa)");
        PLANT_TRANSLATIONS.put("हल्दी", "Haridra Turmeric (Curcuma longa)");
        PLANT_TRANSLATIONS.put("हरिद्रा", "Haridra (Curcuma longa)");
        PLANT_TRANSLATIONS.put("तुळस", "Tulsi Holy Basil (Ocimum sanctum)");
        PLANT_TRANSLATIONS.put("तुलसी", "Tulsi Holy Basil (Ocimum sanctum)");
        PLANT_TRANSLATIONS.put("कडुनिंब", "Neem (Azadirachta indica)");
        PLANT_TRANSLATIONS.put("नीम", "Neem (Azadirachta indica)");
        PLANT_TRANSLATIONS.put("निम्ब", "Neem (Azadirachta indica)");
        PLANT_TRANSLATIONS.put("गुग्गुळ", "Guggulu (Commiphora mukul)");
        PLANT_TRANSLATIONS.put("गुग्गुल", "Guggulu (Commiphora mukul)");
        PLANT_TRANSLATIONS.put("गुग्गुलु", "Guggulu (Commiphora mukul)");
        PLANT_TRANSLATIONS.put("गुळवेल", "Guduchi Giloy (Tinospora cordifolia)");
        PLANT_TRANSLATIONS.put("गिलोय", "Guduchi Giloy (Tinospora cordifolia)");
        PLANT_TRANSLATIONS.put("गुडूची", "Guduchi (Tinospora cordifolia)");
        PLANT_TRANSLATIONS.put("शतावरी", "Shatavari (Asparagus racemosus)");
        PLANT_TRANSLATIONS.put("ब्राह्मी", "Brahmi (Bacopa monnieri)");
        PLANT_TRANSLATIONS.put("आवळा", "Amalaki (Phyllanthus emblica)");
        PLANT_TRANSLATIONS.put("आंवला", "Amalaki (Phyllanthus emblica)");
        PLANT_TRANSLATIONS.put("आमलकी", "Amalaki (Phyllanthus emblica)");
        PLANT_TRANSLATIONS.put("अर्जुन", "Arjuna (Terminalia arjuna)");
        PLANT_TRANSLATIONS.put("सुंठ", "Shunthi Dry Ginger (Zingiber officinale)");
        PLANT_TRANSLATIONS.put("सोंठ", "Shunthi Dry Ginger (Zingiber officinale)");
        PLANT_TRANSLATIONS.put("ज्येष्ठमध", "Yashtimadhu Licorice (Glycyrrhiza glabra)");
        PLANT_TRANSLATIONS.put("मुलेठी", "Yashtimadhu Licorice (Glycyrrhiza glabra)");
        PLANT_TRANSLATIONS.put("यष्टिमधु", "Yashtimadhu (Glycyrrhiza glabra)");
        PLANT_TRANSLATIONS.put("कोरफड", "Kumari Aloe Vera (Aloe barbadensis)");
        PLANT_TRANSLATIONS.put("घृतकुमारी", "Kumari Aloe Vera (Aloe barbadensis)");
        PLANT_TRANSLATIONS.put("एलोवेरा", "Kumari Aloe Vera (Aloe barbadensis)");
        PLANT_TRANSLATIONS.put("भृंगराज", "Bhringaraj (Eclipta alba)");
        PLANT_TRANSLATIONS.put("पिंपळी", "Pippali (Piper longum)");
        PLANT_TRANSLATIONS.put("पिप्पली", "Pippali (Piper longum)");
        PLANT_TRANSLATIONS.put("त्रिफळा", "Triphala formulation");
        PLANT_TRANSLATIONS.put("त्रिफला", "Triphala formulation");
        PLANT_TRANSLATIONS.put("च्यवनप्राश", "Chyawanprash formulation");
    }

    // Statutory and legal translations
    private static final Map<String, String> STATUTORY_TRANSLATIONS = new LinkedHashMap<>();
    static {
        STATUTORY_TRANSLATIONS.put("कलम ३(पी)", "Section 3(p)");
        STATUTORY_TRANSLATIONS.put("कलम 3(p)", "Section 3(p)");
        STATUTORY_TRANSLATIONS.put("कलम 3(पी)", "Section 3(p)");
        STATUTORY_TRANSLATIONS.put("धारा ३(पी)", "Section 3(p)");
        STATUTORY_TRANSLATIONS.put("धारा 3(p)", "Section 3(p)");
        STATUTORY_TRANSLATIONS.put("धारा 3(पी)", "Section 3(p)");

        STATUTORY_TRANSLATIONS.put("कलम ३(डी)", "Section 3(d)");
        STATUTORY_TRANSLATIONS.put("कलम 3(d)", "Section 3(d)");
        STATUTORY_TRANSLATIONS.put("धारा ३(डी)", "Section 3(d)");
        STATUTORY_TRANSLATIONS.put("धारा 3(d)", "Section 3(d)");

        STATUTORY_TRANSLATIONS.put("कलम ३(ई)", "Section 3(e)");
        STATUTORY_TRANSLATIONS.put("कलम 3(e)", "Section 3(e)");
        STATUTORY_TRANSLATIONS.put("धारा ३(ई)", "Section 3(e)");
        STATUTORY_TRANSLATIONS.put("धारा 3(e)", "Section 3(e)");

        STATUTORY_TRANSLATIONS.put("नियम १५८-बी", "Rule 158-B");
        STATUTORY_TRANSLATIONS.put("नियम 158-B", "Rule 158-B");
        STATUTORY_TRANSLATIONS.put("नियम 158-बी", "Rule 158-B");

        STATUTORY_TRANSLATIONS.put("फॉर्म २५-डी", "Form 25-D");
        STATUTORY_TRANSLATIONS.put("फॉर्म 25-D", "Form 25-D");
        STATUTORY_TRANSLATIONS.put("फॉर्म 25-डी", "Form 25-D");

        STATUTORY_TRANSLATIONS.put("फॉर्म १", "NBA Form 1");
        STATUTORY_TRANSLATIONS.put("फॉर्म 1", "NBA Form 1");
        STATUTORY_TRANSLATIONS.put("फॉर्म ३", "NBA Form 3");
        STATUTORY_TRANSLATIONS.put("फॉर्म 3", "NBA Form 3");

        STATUTORY_TRANSLATIONS.put("पेटंट", "patent");
        STATUTORY_TRANSLATIONS.put("पेटेंट", "patent");
        STATUTORY_TRANSLATIONS.put("ट्रेडमार्क", "trademark");
        STATUTORY_TRANSLATIONS.put("व्यापारी चिन्ह", "trademark");
        STATUTORY_TRANSLATIONS.put("भौगोलिक मानांकन", "Geographical Indication");
        STATUTORY_TRANSLATIONS.put("भौगोलिक संकेतक", "Geographical Indication");
        STATUTORY_TRANSLATIONS.put("जीआय", "GI");

        STATUTORY_TRANSLATIONS.put("पारंपारिक ज्ञान", "traditional knowledge");
        STATUTORY_TRANSLATIONS.put("पारंपरिक ज्ञान", "traditional knowledge");
        STATUTORY_TRANSLATIONS.put("शास्त्रीय ग्रंथ", "classical Ayurvedic treatise");
        STATUTORY_TRANSLATIONS.put("जैवविविधता", "biological diversity");
        STATUTORY_TRANSLATIONS.put("जैव विविधता", "biological diversity");
        STATUTORY_TRANSLATIONS.put("अर्क", "extract");
        STATUTORY_TRANSLATIONS.put("चूर्ण", "powder");
        STATUTORY_TRANSLATIONS.put("तेल", "oil");
        STATUTORY_TRANSLATIONS.put("काढा", "decoction");
        STATUTORY_TRANSLATIONS.put("काढ़ा", "decoction");
    }

    /**
     * Detect the user's language using script heuristics and lexical markers,
     * unless explicitly chosen by the user.
     */
    public Language detectLanguage(String text, String requestedLanguageCode) {
        if (requestedLanguageCode != null && !requestedLanguageCode.isBlank() && !requestedLanguageCode.equalsIgnoreCase("AUTO")) {
            return Language.fromCode(requestedLanguageCode);
        }

        if (text == null || text.isBlank()) {
            return Language.ENGLISH;
        }

        // Check for Devanagari script
        Matcher matcher = DEVANAGARI_PATTERN.matcher(text);
        if (!matcher.find()) {
            return Language.ENGLISH;
        }

        // Analyze tokens to disambiguate Marathi vs Hindi
        String[] words = text.toLowerCase().replaceAll("[^\\u0900-\\u097Fa-zA-Z0-9\\s]", " ").split("\\s+");
        int marathiScore = 0;
        int hindiScore = 0;

        for (String w : words) {
            if (MARATHI_MARKERS.contains(w)) {
                marathiScore += 2;
            }
            if (HINDI_MARKERS.contains(w)) {
                hindiScore += 2;
            }
        }

        log.debug("Language Detection Scores: Marathi={}, Hindi={} for query: '{}'", marathiScore, hindiScore, text);

        if (marathiScore > hindiScore) {
            return Language.MARATHI;
        } else if (hindiScore > marathiScore) {
            return Language.HINDI;
        }

        // Default to Hindi if generic Devanagari with no strong markers
        return Language.HINDI;
    }

    /**
     * Normalizes a multilingual query (Hindi or Marathi) to standard English concepts
     * so that pgvector HNSW and BM25 hybrid search match the legal corpus and TKRC taxonomy.
     */
    public String normalizeQueryToEnglish(String query, Language language) {
        if (query == null || language == Language.ENGLISH) {
            return query != null ? query : "";
        }

        StringBuilder normalized = new StringBuilder(query);

        // 1. Substitute Statutory & Legal Terms
        for (Map.Entry<String, String> entry : STATUTORY_TRANSLATIONS.entrySet()) {
            if (normalized.toString().contains(entry.getKey())) {
                normalized.append(" ").append(entry.getValue());
            }
        }

        // 2. Substitute Botanical & Formulation Names
        for (Map.Entry<String, String> entry : PLANT_TRANSLATIONS.entrySet()) {
            if (normalized.toString().contains(entry.getKey())) {
                normalized.append(" ").append(entry.getValue());
            }
        }

        String result = normalized.toString().trim();
        log.info("Normalized multilingual query [{} -> EN]: '{}'", language.getCode(), result);
        return result;
    }

    /**
     * Localizes the synthesized ChatMessageResponse into authoritative Devanagari Hindi or Marathi,
     * strictly preserving statutory sections (Section 3(p), Rule 158-B, Form 25-D, A61K 36/81) intact.
     */
    public ChatMessageResponse localizeResponse(ChatMessageResponse response, Language targetLanguage) {
        if (response == null || targetLanguage == Language.ENGLISH) {
            if (response != null) {
                response.setLanguage("en");
                response.setDetectedLanguage("en");
            }
            return response;
        }

        response.setLanguage(targetLanguage.getCode());
        response.setDetectedLanguage(targetLanguage.getCode());

        boolean isMarathi = (targetLanguage == Language.MARATHI);

        // 1. Localize Bot Header Message
        if (response.getStatus() == ChatMessageResponse.DialogueStatus.CLARIFICATION_REQUIRED) {
            response.setBotMessage(isMarathi
                    ? "आयुष आयपीआर सहाय्यक (IP-SHAKTI) मध्ये आपले स्वागत आहे. आपल्या आयुर्वेदिक फॉर्म्युलेशनच्या अचूक पेटंट व नियामक मूल्यांकनासाठी, कृपया खालील कायदेशीर बाबी स्पष्ट करा:"
                    : "आयुष आईपीआर सहायक (IP-SHAKTI) में आपका स्वागत है। आपके आयुर्वेदिक फॉर्मूलेशन के सटीक पेटेंट और विनियामक मूल्यांकन के लिए, कृपया निम्नलिखित कानूनी बिंदुओं की पुष्टि करें:"
            );

            // Localize Clarification Prompt
            ClarificationPrompt prompt = response.getClarificationPrompt();
            if (prompt != null) {
                localizeClarificationPrompt(prompt, isMarathi);
            }
        } else if (response.getStatus() == ChatMessageResponse.DialogueStatus.OUT_OF_SCOPE
                || response.getStatus() == ChatMessageResponse.DialogueStatus.SAFE_ABSTENTION) {
            // Preserve the specific domain relevance or safe abstention advisory message
            if (response.getStatus() == ChatMessageResponse.DialogueStatus.OUT_OF_SCOPE) {
                response.setDisclaimer(isMarathi
                        ? "कार्यक्षेत्र मर्यादा: IP-SHAKTI केवळ आयुष, आयुर्वेदिक घटक आणि भारतीय जैवविविधता कायद्याशी संबंधित बाबींचे विश्लेषण करते. कार्यक्षेत्राबाहेरील किंवा गैर-औषधी घटकांसाठी कायदेशीर शोध घेतला जात नाही."
                        : "डोमेन सीमा: IP-SHAKTI विशेष रूप से आयुष, वानस्पतिक फॉर्मूलेशन और जैविक विविधता अधिनियम के लिए समर्पित है। कार्यक्षेत्र से बाहर के इनपुट के लिए विनियामक डेटा निष्पादित नहीं किया जाता।"
                );
            }
            return response;
        } else {
            response.setBotMessage(isMarathi
                    ? "मूल्यांकन पूर्ण झाले! भारतीय पेटंट कायदा, औषध व प्रसाधने नियम आणि जैविक विविधता कायद्यांतर्गत आपल्या फॉर्म्युलेशनचे 5-स्तंभ (5 Pillars) कायदेशीर विश्लेषण खालीलप्रमाणे आहे:"
                    : "मूल्यांकन पूर्ण हुआ! भारतीय पेटेंट अधिनियम, औषधि एवं प्रसाधन नियम तथा जैविक विविधता अधिनियम के अंतर्गत आपके फॉर्मूलेशन का 5-स्तंभ (5 Pillars) कानूनी विश्लेषण यहाँ प्रस्तुत है:"
            );

            // Localize 5 Pillars
            FivePillarsResponse pillars = response.getPillars();
            if (pillars != null) {
                localizeFivePillars(pillars, isMarathi);
            }

            // Localize Plain Language Summary for Vaidyas and Farmers
            if (response.getLlmDeliverables() != null && response.getLlmDeliverables().getPlainLanguageSummary() != null) {
                com.ayurveda.ipr.chat.model.ExecutiveLegalDeliverables.PlainLanguageSummary plain = response.getLlmDeliverables().getPlainLanguageSummary();
                plain.setTargetLanguage(targetLanguage.getCode());
                if (isMarathi) {
                    plain.setHeadline("वैद्य व उत्पादकांसाठी सोप्या भाषेत कायदेशीर सारांश");
                    plain.setCanISellToday("नाही (थेट विक्रीपूर्वी राज्य आयुष परवाना Form 25-D आणि राष्ट्रीय जैवविविधता मंडळाची मंजुरी आवश्यक आहे).");
                    plain.setImmediateNextSteps(Arrays.asList(
                            "पायरी १: राज्य आयुष परवाना प्राधिकरणाकडे Form 25-D परवान्यासाठी अर्ज दाखल करा.",
                            "पायरी २: राष्ट्रीय जैवविविधता प्राधिकरणाचा (NBA) Form 1 व Form 3 अर्ज सादर करा.",
                            "पायरी ३: आपल्या ब्रँड नावाचा ट्रेडमार्क (Class 5) तात्काळ नोंदणीकृत करा."
                    ));
                } else {
                    plain.setHeadline("वैद्यों और नवप्रवर्तकों के लिए सरल कानूनी सारांश");
                    plain.setCanISellToday("नहीं (व्यावसायिक बिक्री से पूर्व राज्य आयुष लाइसेंस Form 25-D और राष्ट्रीय जैवविविधता प्राधिकरण (NBA) अनुमोदन अनिवार्य है)।");
                    plain.setImmediateNextSteps(Arrays.asList(
                            "चरण 1: राज्य आयुष लाइसेंसिंग प्राधिकरण में Form 25-D के लिए आवेदन करें।",
                            "चरण 2: राष्ट्रीय जैवविविधता प्राधिकरण (NBA) में Form 1 और Form 3 प्रस्तुत करें।",
                            "चरण 3: अपने विशिष्ट ब्रांड नाम का ट्रेडमार्क (Class 5) पंजीकृत करवाएं।"
                    ));
                }
            }
        }

        // 2. Localize Disclaimer
        response.setDisclaimer(isMarathi
                ? "माहिती केवळ शैक्षणिक आणि मार्गदर्शनासाठी भारतीय कायद्यानुसार प्रदान केली आहे. हा कोणताही अधिकृत कायदेशीर सल्ला नाही. शासकीय पोर्टलवर अर्ज करण्यापूर्वी कायदेशीर सल्लागाराचा सल्ला घ्यावा."
                : "यह जानकारी केवल शैक्षणिक और मार्गदर्शन के उद्देश्य से भारतीय विधि के अनुसार प्रदान की गई है। यह औपचारिक कानूनी सलाह नहीं है। शासकीय पोर्टल पर आवेदन करने से पूर्व विशेषज्ञ से परामर्श अवश्य लें।"
        );

        return response;
    }

    private void localizeClarificationPrompt(ClarificationPrompt prompt, boolean isMarathi) {
        String param = prompt.getQuestionKey();
        if ("isClassical".equalsIgnoreCase(param)) {
            prompt.setQuestionText(isMarathi
                    ? "आपले फॉर्म्युलेशन चरक, सुश्रुत किंवा भावप्रकाश यांसारख्या अधिकृत शास्त्रीय ग्रंथांमधील मूळ कृतीवर आधारित आहे का?"
                    : "क्या आपका फॉर्मूलेशन चरक, सुश्रुत या भावप्रकाश जैसे आधिकारिक शास्त्रीय आयुर्वेदिक ग्रंथों पर आधारित है?"
            );
            if (prompt.getOptions() != null) {
                for (ClarificationOption opt : prompt.getOptions()) {
                    if ("YES".equalsIgnoreCase(opt.getValue())) {
                        opt.setLabel(isMarathi ? "होय (शास्त्रीय ग्रंथांवर आधारित मूळ योग)" : "हाँ (शास्त्रीय ग्रंथों पर आधारित मूल योग)");
                    } else if ("NO".equalsIgnoreCase(opt.getValue())) {
                        opt.setLabel(isMarathi ? "नाही (नवीन संशोधित किंवा सुधारित फॉर्म्युलेशन)" : "नहीं (नवीन अथवा संशोधित फॉर्मूलेशन)");
                    } else {
                        opt.setLabel(isMarathi ? "माहिती नाही / खात्री नाही" : "निश्चित नहीं / पता नहीं");
                    }
                }
            }
        } else if ("technicalNovelty".equalsIgnoreCase(param)) {
            prompt.setQuestionText(isMarathi
                    ? "आपल्या फॉर्म्युलेशनमध्ये नवीन निष्कर्ष तंत्रज्ञान (Nano/Phytosome) किंवा घटकांमधील सिनर्जिस्टिक प्रमाण सिद्ध झाले आहे का?"
                    : "क्या आपके फॉर्मूलेशन में नवीन डिलीवरी तकनीक (Nano/Phytosome) या घटकों का सहक्रियात्मक (Synergistic) प्रभाव सिद्ध हुआ है?"
            );
            if (prompt.getOptions() != null) {
                for (ClarificationOption opt : prompt.getOptions()) {
                    if ("NANO_EXTRACT".equalsIgnoreCase(opt.getValue())) {
                        opt.setLabel(isMarathi ? "नवीन औषध वितरण प्रणाली (Nano-Emulsion / Liposome)" : "नवीन डिलीवरी प्रणाली (Nano-Emulsion / Liposome)");
                    } else if ("SYNERGISTIC_RATIO".equalsIgnoreCase(opt.getValue())) {
                        opt.setLabel(isMarathi ? "घटकांचे विशिष्ट सिनर्जिस्टिक प्रमाण (लॅब डेटा उपलब्ध)" : "विशिष्ट सहक्रियात्मक अनुपात (प्रयोगशाला डेटा उपलब्ध)");
                    } else if ("PHYTOCHEMICAL".equalsIgnoreCase(opt.getValue())) {
                        opt.setLabel(isMarathi ? "शुद्ध फायटोकेमिकल अर्क (>90% मार्कर शुद्धता)" : "विशुद्ध फाइटोकेमिकल (>90% मार्कर शुद्धता)");
                    } else if ("CRUDE_MIXTURE".equalsIgnoreCase(opt.getValue())) {
                        opt.setLabel(isMarathi ? "ज्ञात आयुर्वेदिक चूर्णांचे साधे मिश्रण" : "पारंपरिक चूर्ण / योगों का साधारण मिश्रण");
                    }
                }
            }
        }
    }

    private void localizeFivePillars(FivePillarsResponse pillars, boolean isMarathi) {
        // Pillar 1: IP Analysis
        FivePillarsResponse.IpPillar ip = pillars.getIpAnalysis();
        if (ip != null) {
            if (ip.isPatentableInIndia()) {
                ip.setVerdict(isMarathi
                        ? "पेटंट पात्र (कलम ३ अंतर्गत सूट) [Patentable under Indian Law]"
                        : "पेटेंट योग्य (धारा 3 के तहत अनुमत) [Patentable under Indian Law]"
                );
            } else {
                ip.setVerdict(isMarathi
                        ? "पेटंट अपात्र: कलम ३(पी) [Section 3(p)] व कलम ३(ई) [Section 3(e)] अंतर्गत प्रतिबंध"
                        : "पेटेंट अयोग्य: धारा 3(p) [Section 3(p)] एवं धारा 3(e) [Section 3(e)] के तहत वर्जित"
                );
            }
        }

        // Pillar 2: Regulatory Checklist
        FivePillarsResponse.RegulatoryPillar reg = pillars.getRegulatoryAnalysis();
        if (reg != null) {
            reg.setAyushEvidenceChecklist(isMarathi
                    ? "नियम १५८-बी [Rule 158-B] पुरावा: मान्यताप्राप्त ग्रंथांचे संदर्भ, सुरक्षा अभ्यास व जीएमपी (GMP) प्रमाणपत्र अनिवार्य."
                    : "नियम 158-B [Rule 158-B] प्रमाण: प्रथम अनुसूची के ग्रंथ संदर्भ, सुरक्षा परीक्षण एवं जीएमपी (GMP) प्रमाणन आवश्यक।"
            );
        }

        // Pillar 3: ABS Pillar
        FivePillarsResponse.AbsPillar abs = pillars.getAbsCheck();
        if (abs != null) {
            abs.setGoverningSection(isMarathi
                    ? "जैविक विविधता कायदा २००२: कलम ३, कलम ६ व कलम ७ [Biological Diversity Act 2002, Sections 3, 6 & 7]"
                    : "जैविक विविधता अधिनियम 2002: धारा 3, धारा 6 एवं धारा 7 [Biological Diversity Act 2002, Sections 3, 6 & 7]"
            );
        }

        // Pillar 4: TKDL Prior-Art
        FivePillarsResponse.TkdlPillar tkdl = pillars.getTkdlCheck();
        if (tkdl != null) {
            tkdl.setPriorArtRiskWarning(isMarathi
                    ? "टीकेडीएल (TKDL) पूर्व-कला इशारा: भारतीय पारंपरिक ज्ञान डिजिटल लायब्ररीमध्ये या औषधी वनस्पतीची पूर्व-नोंद आढळली आहे. कलम ३(पी) [Section 3(p)] अंतर्गत ज्ञात घटकांच्या अर्काला थेट पेटंट दिले जात नाही. पेटंट मिळवण्यासाठी नोव्हेल डिलिव्हरी मेकॅनिझम किंवा सिनर्जिस्टिक रेशो सिद्ध करणे बंधनकारक आहे."
                    : "टीकेडीएल (TKDL) पूर्व कला चेतावनी: पारंपरिक ज्ञान डिजिटल लाइब्रेरी में इस औषधीय पौधे का विस्तृत विवरण पूर्व-अभिलेखित है। धारा 3(p) [Section 3(p)] के अंतर्गत ज्ञात गुणों के सीधे उद्धरण पर पेटेंट स्वतः निरस्त हो जाता है। पेटेंट संरक्षण हेतु नवीन निष्कर्षण पद्धति अथवा सहक्रियात्मक अनुपात सिद्ध करना अनिवार्य है।"
            );
        }
    }
}
