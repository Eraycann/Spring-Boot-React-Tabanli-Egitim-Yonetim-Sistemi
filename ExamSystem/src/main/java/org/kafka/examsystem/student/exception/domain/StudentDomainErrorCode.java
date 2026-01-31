package org.kafka.examsystem.student.exception.domain;

import lombok.Getter;
import org.kafka.examsystem.common.exception.base.BaseErrorCode;
import org.springframework.http.HttpStatus;

@Getter
public enum StudentDomainErrorCode implements BaseErrorCode {

    STUDENT_NOT_FOUND("STUDENT_001", "Student not found.", HttpStatus.NOT_FOUND),
    UNAUTHORIZED_STUDENT_ACCESS("STUDENT_002", "Unauthorized access to student data.", HttpStatus.FORBIDDEN),
    STUDENT_ALREADY_EXISTS("STUDENT_003", "Student with given details already exists.", HttpStatus.CONFLICT),
    STUDENT_DELETION_FAILED("STUDENT_004", "Student cannot be deleted due to existing enrollments.", HttpStatus.BAD_REQUEST);


    private final String code;
    private final String message;
    private final HttpStatus status;

    StudentDomainErrorCode(String code, String message, HttpStatus status) {
        this.code = code;
        this.message = message;
        this.status = status;
    }

}