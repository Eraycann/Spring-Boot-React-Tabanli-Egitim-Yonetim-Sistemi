package org.kafka.examsystem.parent.exception.validation;


import org.kafka.examsystem.common.exception.base.BaseValidationException;

public class ParentValidationException extends BaseValidationException {
    public ParentValidationException(ParentValidationErrorCode errorCode) {
        super(errorCode);
    }
}