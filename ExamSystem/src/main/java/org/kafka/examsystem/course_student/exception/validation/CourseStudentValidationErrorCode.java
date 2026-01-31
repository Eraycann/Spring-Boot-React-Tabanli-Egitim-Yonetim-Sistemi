package org.kafka.examsystem.course_student.exception.validation;


import lombok.Getter;
import org.kafka.examsystem.common.exception.base.BaseErrorCode;
import org.springframework.http.HttpStatus;

@Getter
public enum CourseStudentValidationErrorCode implements BaseErrorCode {

    COURSE_ID_MUST_NOT_BE_NULL("COURSE-STUDENT-VALIDATION-001", "Kurs ID boş olamaz.", HttpStatus.BAD_REQUEST),
    STUDENT_ALREADY_ENROLLED("COURSE-STUDENT-VALIDATION-002", "Öğrenci zaten bu kursa kayıtlı.", HttpStatus.CONFLICT),
    STUDENT_NOT_ENROLLED("COURSE-STUDENT-VALIDATION-003", "Öğrenci bu kursa kayıtlı değil.", HttpStatus.NOT_FOUND);

    private final String code;
    private final String message;
    private final HttpStatus status;

    CourseStudentValidationErrorCode(String code, String message, HttpStatus status) {
        this.code = code;
        this.message = message;
        this.status = status;
    }

}