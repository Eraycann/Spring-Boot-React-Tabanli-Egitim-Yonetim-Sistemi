package org.kafka.examsystem.exam_question.exception.domain;

import lombok.Getter;
import org.kafka.examsystem.common.exception.base.BaseErrorCode;
import org.springframework.http.HttpStatus;

@Getter
public enum ExamQuestionDomainErrorCode implements BaseErrorCode {

    QUESTION_NOT_FOUND("EQ-001", "Sınav sorusu bulunamadı.", HttpStatus.NOT_FOUND),
    UNAUTHORIZED_QUESTION_ACCESS("EQ-002", "Sınav sorusuna erişim yetkiniz yok.", HttpStatus.FORBIDDEN),
    JSON_PROCESSING_ERROR("EQ-003", "JSON verisi işlenirken bir hata oluştu.", HttpStatus.INTERNAL_SERVER_ERROR);

    private final String code;
    private final String message;
    private final HttpStatus status;

    ExamQuestionDomainErrorCode(String code, String message, HttpStatus status) {
        this.code = code;
        this.message = message;
        this.status = status;
    }

}