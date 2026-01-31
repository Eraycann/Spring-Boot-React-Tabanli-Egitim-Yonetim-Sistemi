package org.kafka.examsystem.auth.exception.domain;


import org.kafka.examsystem.common.exception.base.BaseDomainException;

public class AuthDomainException extends BaseDomainException {
    public AuthDomainException(AuthDomainErrorCode errorCode) {
        super(errorCode);
    }
}