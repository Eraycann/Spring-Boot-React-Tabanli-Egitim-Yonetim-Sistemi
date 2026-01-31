package org.kafka.examsystem.parent.exception.domain;


import org.kafka.examsystem.common.exception.base.BaseDomainException;

public class ParentDomainException extends BaseDomainException {
    public ParentDomainException(ParentDomainErrorCode errorCode) {
        super(errorCode);
    }
}