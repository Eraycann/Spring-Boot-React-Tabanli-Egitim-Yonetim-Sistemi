package org.kafka.examsystem.teacher.exception.domain;

import lombok.Getter;
import org.kafka.examsystem.common.exception.base.BaseErrorCode;
import org.springframework.http.HttpStatus;

@Getter
public enum TeacherDomainErrorCode implements BaseErrorCode {

    TEACHER_NOT_FOUND("TEACHER-DOMAIN-001", "Belirtilen öğretmen bulunamadı.", HttpStatus.NOT_FOUND);

    private final String code;
    private final String message;
    private final HttpStatus status;

    TeacherDomainErrorCode(String code, String message, HttpStatus status) {
        this.code = code;
        this.message = message;
        this.status = status;
    }

}