package org.kafka.examsystem.exam.exception.domain;

import lombok.Getter;
import org.kafka.examsystem.common.exception.base.BaseErrorCode;
import org.springframework.http.HttpStatus;

@Getter
public enum ExamDomainErrorCode implements BaseErrorCode {

    EXAM_NOT_FOUND("EXAM-DOMAIN-001", "Sınav bulunamadı.", HttpStatus.NOT_FOUND),
    UNAUTHORIZED_EXAM_ACCESS("EXAM-DOMAIN-002", "Sınav üzerinde işlem yapmaya yetkiniz yok.", HttpStatus.FORBIDDEN),
    COURSE_NOT_FOUND("EXAM-DOMAIN-003", "İlgili kurs bulunamadı.", HttpStatus.NOT_FOUND),
    EXAM_EXPIRED("EXAM-DOMAIN-004", "Sınavın süresi dolmuştur veya aktif değildir.", HttpStatus.BAD_REQUEST);

    private final String code;
    private final String message;
    private final HttpStatus status;

    ExamDomainErrorCode(String code, String message, HttpStatus status) {
        this.code = code;
        this.message = message;
        this.status = status;
    }

}