package org.kafka.examsystem.course.exception.validation;


import org.kafka.examsystem.common.exception.base.BaseValidationException;

public class CourseValidationException extends BaseValidationException {
    public CourseValidationException(CourseValidationErrorCode errorCode) {
        super(errorCode);
    }
}