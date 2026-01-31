package org.kafka.examsystem.course_student.exception.validation;


import org.kafka.examsystem.common.exception.base.BaseValidationException;

public class CourseStudentValidationException extends BaseValidationException {
    public CourseStudentValidationException(CourseStudentValidationErrorCode errorCode) {
        super(errorCode);
    }
}