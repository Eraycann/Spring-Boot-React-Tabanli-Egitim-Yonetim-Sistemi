package org.kafka.examsystem.exam_question.exception.domain;


import org.kafka.examsystem.common.exception.base.BaseDomainException;

public class ExamQuestionDomainException extends BaseDomainException {
    public ExamQuestionDomainException(ExamQuestionDomainErrorCode errorCode) {
        super(errorCode);
    }
}