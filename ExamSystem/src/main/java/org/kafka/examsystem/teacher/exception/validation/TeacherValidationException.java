package org.kafka.examsystem.teacher.exception.validation;


import org.kafka.examsystem.common.exception.base.BaseValidationException;

public class TeacherValidationException extends BaseValidationException {
    public TeacherValidationException(TeacherValidationErrorCode errorCode) {
        super(errorCode);
    }
}