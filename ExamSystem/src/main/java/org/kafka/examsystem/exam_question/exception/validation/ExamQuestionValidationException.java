package org.kafka.examsystem.exam_question.exception.validation;


import org.kafka.examsystem.common.exception.base.BaseValidationException;

public class ExamQuestionValidationException extends BaseValidationException {
    public ExamQuestionValidationException(ExamQuestionValidationErrorCode errorCode) {
        super(errorCode);
    }
}