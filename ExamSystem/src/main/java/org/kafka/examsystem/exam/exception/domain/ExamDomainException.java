package org.kafka.examsystem.exam.exception.domain;


import org.kafka.examsystem.common.exception.base.BaseDomainException;

public class ExamDomainException extends BaseDomainException {
    public ExamDomainException(ExamDomainErrorCode errorCode) {
        super(errorCode);
    }
}