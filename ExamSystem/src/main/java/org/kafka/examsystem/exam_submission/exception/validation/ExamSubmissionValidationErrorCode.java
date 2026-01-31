package org.kafka.examsystem.exam_submission.exception.validation;


import lombok.Getter;
import org.kafka.examsystem.common.exception.base.BaseErrorCode;
import org.springframework.http.HttpStatus;

@Getter
public enum ExamSubmissionValidationErrorCode implements BaseErrorCode {


    BOŞ("BOŞ", "BOŞ", HttpStatus.BAD_REQUEST);

    private final String code;
    private final String message;
    private final HttpStatus status;

    ExamSubmissionValidationErrorCode(String code, String message, HttpStatus status) {
        this.code = code;
        this.message = message;
        this.status = status;
    }

}