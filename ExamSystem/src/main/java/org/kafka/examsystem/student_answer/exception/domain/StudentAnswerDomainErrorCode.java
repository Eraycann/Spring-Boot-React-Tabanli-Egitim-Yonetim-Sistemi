package org.kafka.examsystem.student_answer.exception.domain;

import lombok.Getter;
import org.kafka.examsystem.common.exception.base.BaseErrorCode;
import org.springframework.http.HttpStatus;

@Getter
public enum StudentAnswerDomainErrorCode implements BaseErrorCode {

    UNAUTHORIZED_ANSWER_SUBMISSION("STUDENT-ANSWER-DOMAIN-001", "Cevap göndermek için yetkiniz yok.", HttpStatus.FORBIDDEN),
    UNAUTHORIZED_ANSWER_ACCESS("STUDENT-ANSWER-DOMAIN-002", "Cevaplara erişim için yetkiniz yok.", HttpStatus.FORBIDDEN);

    private final String code;
    private final String message;
    private final HttpStatus status;

    StudentAnswerDomainErrorCode(String code, String message, HttpStatus status) {
        this.code = code;
        this.message = message;
        this.status = status;
    }

}