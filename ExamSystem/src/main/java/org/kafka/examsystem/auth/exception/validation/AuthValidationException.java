package org.kafka.examsystem.auth.exception.validation;


import org.kafka.examsystem.common.exception.base.BaseValidationException;

public class AuthValidationException extends BaseValidationException {
    public AuthValidationException(AuthValidationErrorCode errorCode) {
        super(errorCode);
    }
}