package org.kafka.examsystem.student.exception.validation;


import org.kafka.examsystem.common.exception.base.BaseValidationException;

public class StudentValidationException extends BaseValidationException {
    public StudentValidationException(StudentValidationErrorCode errorCode) {
        super(errorCode);
    }
}