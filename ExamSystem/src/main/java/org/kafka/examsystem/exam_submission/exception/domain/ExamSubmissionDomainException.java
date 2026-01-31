package org.kafka.examsystem.exam_submission.exception.domain;


import org.kafka.examsystem.common.exception.base.BaseDomainException;

public class ExamSubmissionDomainException extends BaseDomainException {
    public ExamSubmissionDomainException(ExamSubmissionDomainErrorCode errorCode) {
        super(errorCode);
    }
}