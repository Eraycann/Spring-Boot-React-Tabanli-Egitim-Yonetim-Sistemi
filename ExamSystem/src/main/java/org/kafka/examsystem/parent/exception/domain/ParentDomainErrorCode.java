package org.kafka.examsystem.parent.exception.domain;

import lombok.Getter;
import org.kafka.examsystem.common.exception.base.BaseErrorCode;
import org.springframework.http.HttpStatus;

@Getter
public enum ParentDomainErrorCode implements BaseErrorCode {

    PARENT_NOT_FOUND("PARENT-DOMAIN-001", "Belirtilen veli bulunamadı.", HttpStatus.NOT_FOUND),
    UNAUTHORIZED_PARENT_ACCESS("PARENT-DOMAIN-002", "Bu veliye erişim yetkiniz yok.", HttpStatus.FORBIDDEN); // Yeni hata kodu eklendi

    private final String code;
    private final String message;
    private final HttpStatus status;

    ParentDomainErrorCode(String code, String message, HttpStatus status) {
        this.code = code;
        this.message = message;
        this.status = status;
    }

}