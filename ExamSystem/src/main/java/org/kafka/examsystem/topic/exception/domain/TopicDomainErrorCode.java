package org.kafka.examsystem.topic.exception.domain;

import lombok.Getter;
import org.kafka.examsystem.common.exception.base.BaseErrorCode;
import org.springframework.http.HttpStatus;

@Getter
public enum TopicDomainErrorCode implements BaseErrorCode {

    TOPIC_NOT_FOUND("TOPIC-DOMAIN-001", "Konu bulunamadı.", HttpStatus.NOT_FOUND),
    UNAUTHORIZED_TOPIC_ACCESS("TOPIC-DOMAIN-002", "Konu üzerinde işlem yapmaya yetkiniz yok.", HttpStatus.FORBIDDEN),
    COURSE_NOT_FOUND("TOPIC-DOMAIN-003", "İlgili kurs bulunamadı.", HttpStatus.NOT_FOUND);

    private final String code;
    private final String message;
    private final HttpStatus status;

    TopicDomainErrorCode(String code, String message, HttpStatus status) {
        this.code = code;
        this.message = message;
        this.status = status;
    }

}