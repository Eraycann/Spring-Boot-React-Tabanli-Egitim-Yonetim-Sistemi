package org.kafka.examsystem.user.exception.domain;

import lombok.Getter;
import org.kafka.examsystem.common.exception.base.BaseErrorCode;
import org.springframework.http.HttpStatus;

@Getter
public enum UserDomainErrorCode implements BaseErrorCode {

    USER_NOT_FOUND("USER-DOMAIN-001", "Belirtilen kullanıcı bulunamadı.", HttpStatus.NOT_FOUND);

    private final String code;
    private final String message;
    private final HttpStatus status;

    UserDomainErrorCode(String code, String message, HttpStatus status) {
        this.code = code;
        this.message = message;
        this.status = status;
    }

}