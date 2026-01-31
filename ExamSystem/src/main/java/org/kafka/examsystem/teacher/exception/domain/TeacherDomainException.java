package org.kafka.examsystem.teacher.exception.domain;


import org.kafka.examsystem.common.exception.base.BaseDomainException;

public class TeacherDomainException extends BaseDomainException {
    public TeacherDomainException(TeacherDomainErrorCode errorCode) {
        super(errorCode);
    }
}