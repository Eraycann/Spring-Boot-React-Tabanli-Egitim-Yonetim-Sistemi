package org.kafka.examsystem.student_answer.exception.domain;


import org.kafka.examsystem.common.exception.base.BaseDomainException;

public class StudentAnswerDomainException extends BaseDomainException {
    public StudentAnswerDomainException(StudentAnswerDomainErrorCode errorCode) {
        super(errorCode);
    }
}