package org.kafka.examsystem.common.exception.dto;

import java.util.List;

public class ErrorResponse {
    private String code;
    private String message;
    private List<String> errors;

    // Mantıksal Validasyon Exception | Domain Exception için
    public ErrorResponse(String code, String message) {
        this.code = code;
        this.message = message;
    }

    // Yüzeysel Validasyon için
    public ErrorResponse(String code, List<String> errors) {
        this.code = code;
        this.errors = errors;
    }

    public String getCode() { return code; }
    public String getMessage() { return message; }
    public List<String> getErrors() { return errors; }
}