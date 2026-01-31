package org.kafka.examsystem.user.exception.domain;


import org.kafka.examsystem.common.exception.base.BaseDomainException;

public class UserDomainException extends BaseDomainException {
    public UserDomainException(UserDomainErrorCode errorCode) {
        super(errorCode);
    }
}