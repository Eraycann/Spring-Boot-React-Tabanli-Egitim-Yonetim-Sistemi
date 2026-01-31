package org.kafka.examsystem.student.exception.validation;


import lombok.Getter;
import org.kafka.examsystem.common.exception.base.BaseErrorCode;
import org.springframework.http.HttpStatus;

@Getter
public enum StudentValidationErrorCode implements BaseErrorCode {

    COURSE_ID_MUST_NOT_BE_NULL("COURSE-VALIDATION-002", "Kurs ID boş olamaz.", HttpStatus.BAD_REQUEST);

    private final String code;
    private final String message;
    private final HttpStatus status;

    StudentValidationErrorCode(String code, String message, HttpStatus status) {
        this.code = code;
        this.message = message;
        this.status = status;
    }

}