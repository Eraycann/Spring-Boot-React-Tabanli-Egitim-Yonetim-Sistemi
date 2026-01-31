package org.kafka.examsystem.course_student.exception.domain;


import org.kafka.examsystem.common.exception.base.BaseDomainException;

public class CourseStudentDomainException extends BaseDomainException {
    public CourseStudentDomainException(CourseStudentDomainErrorCode errorCode) {
        super(errorCode);
    }
}