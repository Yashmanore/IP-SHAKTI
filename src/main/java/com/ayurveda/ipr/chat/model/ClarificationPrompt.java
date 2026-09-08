package com.ayurveda.ipr.chat.model;

import java.util.ArrayList;
import java.util.List;

public class ClarificationPrompt {

    private int step;
    private String questionKey;
    private String questionText;
    private List<ClarificationOption> options = new ArrayList<>();

    public ClarificationPrompt() {
    }

    public ClarificationPrompt(int step, String questionKey, String questionText, List<ClarificationOption> options) {
        this.step = step;
        this.questionKey = questionKey;
        this.questionText = questionText;
        this.options = options;
    }

    public int getStep() {
        return step;
    }

    public void setStep(int step) {
        this.step = step;
    }

    public String getQuestionKey() {
        return questionKey;
    }

    public void setQuestionKey(String questionKey) {
        this.questionKey = questionKey;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public List<ClarificationOption> getOptions() {
        return options;
    }

    public void setOptions(List<ClarificationOption> options) {
        this.options = options;
    }
}
