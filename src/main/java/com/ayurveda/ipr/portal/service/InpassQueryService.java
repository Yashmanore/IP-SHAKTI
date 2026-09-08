package com.ayurveda.ipr.portal.service;

import com.ayurveda.ipr.portal.model.InpassQueryResponse;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Portal 2 Connector: Indian Patent Advanced Search System (InPASS).
 * Translates natural language inquiries into valid Boolean search queries
 * formatted specifically for the Indian Patent Office (CGPDTM) search engine.
 */
@Service
public class InpassQueryService {

    private static final Map<String, BotanicalIpcMapping> BOTANICAL_IPC_MAP = new HashMap<>();

    static {
        // Pre-loaded IPC mappings for top Indian Ayurvedic plants under IPC subclass A61K 36/00
        BOTANICAL_IPC_MAP.put("ashwagandha", new BotanicalIpcMapping("Withania somnifera", "A61K 36/81", "Ashwagandha"));
        BOTANICAL_IPC_MAP.put("withania", new BotanicalIpcMapping("Withania somnifera", "A61K 36/81", "Ashwagandha"));
        BOTANICAL_IPC_MAP.put("haridra", new BotanicalIpcMapping("Curcuma longa", "A61K 36/9066", "Turmeric"));
        BOTANICAL_IPC_MAP.put("turmeric", new BotanicalIpcMapping("Curcuma longa", "A61K 36/9066", "Haldi"));
        BOTANICAL_IPC_MAP.put("curcuma", new BotanicalIpcMapping("Curcuma longa", "A61K 36/9066", "Curcumin"));
        BOTANICAL_IPC_MAP.put("tulsi", new BotanicalIpcMapping("Ocimum sanctum", "A61K 36/53", "Holy Basil"));
        BOTANICAL_IPC_MAP.put("ocimum", new BotanicalIpcMapping("Ocimum sanctum", "A61K 36/53", "Tulasi"));
        BOTANICAL_IPC_MAP.put("neem", new BotanicalIpcMapping("Azadirachta indica", "A61K 36/58", "Nimba"));
        BOTANICAL_IPC_MAP.put("azadirachta", new BotanicalIpcMapping("Azadirachta indica", "A61K 36/58", "Neem"));
        BOTANICAL_IPC_MAP.put("guggulu", new BotanicalIpcMapping("Commiphora mukul", "A61K 36/328", "Guggul"));
        BOTANICAL_IPC_MAP.put("guduchi", new BotanicalIpcMapping("Tinospora cordifolia", "A61K 36/59", "Giloy"));
        BOTANICAL_IPC_MAP.put("giloy", new BotanicalIpcMapping("Tinospora cordifolia", "A61K 36/59", "Guduchi"));
        BOTANICAL_IPC_MAP.put("shatavari", new BotanicalIpcMapping("Asparagus racemosus", "A61K 36/896", "Satavar"));
        BOTANICAL_IPC_MAP.put("brahmi", new BotanicalIpcMapping("Bacopa monnieri", "A61K 36/68", "Water Hyssop"));
        BOTANICAL_IPC_MAP.put("amla", new BotanicalIpcMapping("Phyllanthus emblica", "A61K 36/47", "Amalaki"));
        BOTANICAL_IPC_MAP.put("arjuna", new BotanicalIpcMapping("Terminalia arjuna", "A61K 36/185", "Arjun"));
        BOTANICAL_IPC_MAP.put("triphala", new BotanicalIpcMapping("Phyllanthus emblica", "A61K 36/185", "Triphala"));
        BOTANICAL_IPC_MAP.put("shilajit", new BotanicalIpcMapping("Asphaltum punjabianum", "A61K 35/02", "Mineral Pitch"));
        BOTANICAL_IPC_MAP.put("kalmegh", new BotanicalIpcMapping("Andrographis paniculata", "A61K 36/19", "Chiretta"));
        BOTANICAL_IPC_MAP.put("kutki", new BotanicalIpcMapping("Picrorhiza kurroa", "A61K 36/68", "Katuka"));
        BOTANICAL_IPC_MAP.put("shunthi", new BotanicalIpcMapping("Zingiber officinale", "A61K 36/9068", "Dry Ginger"));
        BOTANICAL_IPC_MAP.put("pippali", new BotanicalIpcMapping("Piper longum", "A61K 36/67", "Long Pepper"));
        BOTANICAL_IPC_MAP.put("yashtimadhu", new BotanicalIpcMapping("Glycyrrhiza glabra", "A61K 36/484", "Mulethi"));
        BOTANICAL_IPC_MAP.put("bhringraj", new BotanicalIpcMapping("Eclipta alba", "A61K 36/28", "False Daisy"));
    }

    public InpassQueryResponse generateInpassQuery(String userInput) {
        String cleanInput = userInput != null ? userInput.trim() : "Ayurveda";
        String lower = cleanInput.toLowerCase();

        // 1. Identify botanical entity and IPC subclass
        BotanicalIpcMapping mapping = null;
        for (Map.Entry<String, BotanicalIpcMapping> entry : BOTANICAL_IPC_MAP.entrySet()) {
            if (lower.contains(entry.getKey())) {
                mapping = entry.getValue();
                break;
            }
        }

        String ipcClass;
        String botanicalBinomial;
        String commonName;

        if (mapping != null) {
            ipcClass = mapping.ipcClass;
            botanicalBinomial = mapping.botanicalBinomial;
            commonName = mapping.commonName;
        } else {
            ipcClass = "A61K 36/00"; // Generic IPC code for medicinal plant compositions
            botanicalBinomial = cleanInput;
            commonName = cleanInput;
        }

        // 2. Synthesize InPASS Boolean syntax
        String booleanQuery = String.format("((IPC: %s) AND (Abstract: \"%s\" OR \"%s\"))",
                ipcClass, botanicalBinomial, commonName);

        String titleQuery = String.format("(Title: \"%s\" OR \"%s\") AND (IPC: %s)",
                botanicalBinomial, commonName, ipcClass);

        List<String> tabs = Arrays.asList(
                "Step 1: Open https://ipindiaservices.gov.in/publicsearch",
                "Step 2: Under 'Patent Search', check 'Published' and 'Granted' checkboxes",
                "Step 3: In the Field dropdown, select 'Abstract' and paste: \"" + botanicalBinomial + "\" OR \"" + commonName + "\"",
                "Step 4: In the second row, select 'AND' + 'IPC' and enter: " + ipcClass,
                "Step 5: Click 'Search' to view all pending, granted, and abandoned Indian patent applications."
        );

        String oppositionAdvice = "Statutory Pre-Grant Opposition Mechanism (Section 25(1)): " +
                "If you discover a pending Indian patent application attempting to claim traditional formulations " +
                "or known properties of " + commonName + " without true inventive step, any person can file a " +
                "Pre-Grant Opposition in Form 7A under Section 25(1)(k) citing Traditional Knowledge and Section 3(p). " +
                "No official government fee is required for filing a pre-grant opposition.";

        return new InpassQueryResponse(
                cleanInput,
                ipcClass,
                booleanQuery,
                titleQuery,
                tabs,
                oppositionAdvice
        );
    }

    private static class BotanicalIpcMapping {
        final String botanicalBinomial;
        final String ipcClass;
        final String commonName;

        BotanicalIpcMapping(String botanicalBinomial, String ipcClass, String commonName) {
            this.botanicalBinomial = botanicalBinomial;
            this.ipcClass = ipcClass;
            this.commonName = commonName;
        }
    }
}
