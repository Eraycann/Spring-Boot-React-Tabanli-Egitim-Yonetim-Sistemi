package org.kafka.examsystem.auth.exception.domain;

import lombok.Getter;
import org.kafka.examsystem.common.exception.base.BaseErrorCode;
import org.springframework.http.HttpStatus;

@Getter
public enum AuthDomainErrorCode implements BaseErrorCode {

    ROLE_NOT_FOUND("AUTH-DOMAIN-001", "Belirtilen rol bulunamadı. Sistem yöneticisiyle iletişime geçin.", HttpStatus.INTERNAL_SERVER_ERROR);

    private final String code;
    private final String message;
    private final HttpStatus status;

    AuthDomainErrorCode(String code, String message, HttpStatus status) {
        this.code = code;
        this.message = message;
        this.status = status;
    }

}