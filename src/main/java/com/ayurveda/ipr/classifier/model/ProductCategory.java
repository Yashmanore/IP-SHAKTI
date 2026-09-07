package com.ayurveda.ipr.classifier.model;

/**
 * Authoritative Ayurvedic Product Categories recognized under Indian law:
 * - Drugs and Cosmetics Act, 1940 & Rules 1945 (Rule 158-B)
 * - Food Safety and Standards (Ayurveda Aahar) Regulations, 2022
 */
public enum ProductCategory {

    CLASSICAL_AYURVEDIC_FORMULATION(
            "Classical Ayurvedic Formulation (Shastriya Aushadhi)",
            "Drugs and Cosmetics Act 1940, First Schedule Books; Rule 158-B",
            "AYUSH State Licensing Authority (Form 25-D / Form 24-D)"
    ),
    PROPRIETARY_AYURVEDIC_MEDICINE_CATEGORY_A(
            "Proprietary Ayurvedic Medicine - Category A (Traditional Ingredients & Indications)",
            "Drugs & Cosmetics Rules 1945, Rule 158-B(1)(A)",
            "AYUSH State Licensing Authority (Proprietary Aushadhi License)"
    ),
    PROPRIETARY_AYURVEDIC_MEDICINE_CATEGORY_B(
            "Proprietary Ayurvedic Medicine - Category B (New Indication / Modified Form)",
            "Drugs & Cosmetics Rules 1945, Rule 158-B(1)(B)",
            "AYUSH State Licensing Authority with DCGI / Technical Review"
    ),
    NEW_BOTANICAL_OR_PHYTOPHARMACEUTICAL(
            "Phytopharmaceutical Drug / Standardized Botanical Extract",
            "Drugs & Cosmetics Rules 1945, Rule 122-E (Phytopharmaceuticals)",
            "Central Drugs Standard Control Organisation (CDSCO / DCGI)"
    ),
    AYURVEDA_AAHAR(
            "Ayurveda Aahar (Food / Dietary Supplement)",
            "Food Safety and Standards (Ayurveda Aahar) Regulations, 2022",
            "Food Safety and Standards Authority of India (FSSAI Central License)"
    ),
    AYURVEDIC_COSMETIC(
            "Ayurvedic Cosmetic (Saundarya Prasadak)",
            "Drugs and Cosmetics Act 1940, Section 3(aaa) & Rule 158-B",
            "AYUSH State Licensing Authority (Form 32-A Cosmetic License)"
    );

    private final String displayName;
    private final String governingAct;
    private final String licensingAuthority;

    ProductCategory(String displayName, String governingAct, String licensingAuthority) {
        this.displayName = displayName;
        this.governingAct = governingAct;
        this.licensingAuthority = licensingAuthority;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getGoverningAct() {
        return governingAct;
    }

    public String getLicensingAuthority() {
        return licensingAuthority;
    }
}
