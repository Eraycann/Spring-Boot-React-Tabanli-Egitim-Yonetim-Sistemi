package org.kafka.examsystem.student_answer.exception.validation;


import org.kafka.examsystem.common.exception.base.BaseValidationException;
import org.kafka.examsystem.exam_submission.exception.validation.ExamSubmissionValidationErrorCode;

public class StudentAnswerValidationException extends BaseValidationException {
    public StudentAnswerValidationException(ExamSubmissionValidationErrorCode errorCode) {
        super(errorCode);
    }
}