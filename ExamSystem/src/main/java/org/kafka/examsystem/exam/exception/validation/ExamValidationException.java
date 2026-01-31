package org.kafka.examsystem.exam.exception.validation;


import org.kafka.examsystem.common.exception.base.BaseValidationException;

public class ExamValidationException extends BaseValidationException {
    public ExamValidationException(ExamValidationErrorCode errorCode) {
        super(errorCode);
    }
}