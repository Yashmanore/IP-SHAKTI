package com.ayurveda.ipr.multilingual.model;

/**
 * Supported natural languages in IP-SHAKTI Sahayak.
 */
public enum Language {
    ENGLISH("en", "English", "English"),
    HINDI("hi", "Hindi", "हिन्दी"),
    MARATHI("mr", "Marathi", "मराठी");

    private final String code;
    private final String englishName;
    private final String nativeName;

    Language(String code, String englishName, String nativeName) {
        this.code = code;
        this.englishName = englishName;
        this.nativeName = nativeName;
    }

    public String getCode() {
        return code;
    }

    public String getEnglishName() {
        return englishName;
    }

    public String getNativeName() {
        return nativeName;
    }

    public static Language fromCode(String code) {
        if (code == null) return ENGLISH;
        String c = code.trim().toLowerCase();
        if (c.equals("hi") || c.equals("hindi") || c.contains("हिन्दी")) return HINDI;
        if (c.equals("mr") || c.equals("marathi") || c.contains("मराठी")) return MARATHI;
        return ENGLISH;
    }
}
