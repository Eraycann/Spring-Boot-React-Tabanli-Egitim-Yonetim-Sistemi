package org.kafka.examsystem.topic.exception.validation;


import org.kafka.examsystem.common.exception.base.BaseValidationException;

public class TopicValidationException extends BaseValidationException {
    public TopicValidationException(TopicValidationErrorCode errorCode) {
        super(errorCode);
    }
}