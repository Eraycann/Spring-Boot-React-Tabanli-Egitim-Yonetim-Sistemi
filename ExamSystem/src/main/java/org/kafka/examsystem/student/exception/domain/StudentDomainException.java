package org.kafka.examsystem.student.exception.domain;


import org.kafka.examsystem.common.exception.base.BaseDomainException;

public class StudentDomainException extends BaseDomainException {
    public StudentDomainException(StudentDomainErrorCode errorCode) {
        super(errorCode);
    }
}