package org.kafka.examsystem.course.exception.domain;


import org.kafka.examsystem.common.exception.base.BaseDomainException;

public class CourseDomainException extends BaseDomainException {
    public CourseDomainException(CourseDomainErrorCode errorCode) {
        super(errorCode);
    }
}