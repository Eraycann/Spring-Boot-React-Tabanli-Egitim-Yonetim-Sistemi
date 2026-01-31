package org.kafka.examsystem.user.exception.validation;


import org.kafka.examsystem.common.exception.base.BaseValidationException;

public class UserValidationException extends BaseValidationException {
    public UserValidationException(UserValidationErrorCode errorCode) {
        super(errorCode);
    }
}