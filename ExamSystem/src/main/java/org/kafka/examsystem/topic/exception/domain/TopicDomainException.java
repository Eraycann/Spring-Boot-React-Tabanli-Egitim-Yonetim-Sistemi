package org.kafka.examsystem.topic.exception.domain;


import org.kafka.examsystem.common.exception.base.BaseDomainException;

public class TopicDomainException extends BaseDomainException {
    public TopicDomainException(TopicDomainErrorCode errorCode) {
        super(errorCode);
    }
}