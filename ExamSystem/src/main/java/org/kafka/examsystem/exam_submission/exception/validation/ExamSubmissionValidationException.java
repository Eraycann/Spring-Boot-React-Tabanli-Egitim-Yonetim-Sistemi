package org.kafka.examsystem.exam_submission.exception.validation;


import org.kafka.examsystem.common.exception.base.BaseValidationException;

public class ExamSubmissionValidationException extends BaseValidationException {
    public ExamSubmissionValidationException(ExamSubmissionValidationErrorCode errorCode) {
        super(errorCode);
    }
}