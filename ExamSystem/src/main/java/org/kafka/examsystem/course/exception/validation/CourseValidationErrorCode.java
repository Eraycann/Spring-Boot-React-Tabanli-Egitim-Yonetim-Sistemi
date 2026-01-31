package org.kafka.examsystem.course.exception.validation;


import lombok.Getter;
import org.kafka.examsystem.common.exception.base.BaseErrorCode;
import org.springframework.http.HttpStatus;

@Getter
public enum CourseValidationErrorCode implements BaseErrorCode {


    COURSE_NAME_ALREADY_EXISTS("COURSE-VALIDATION-001", "Bu isimde bir kurs zaten mevcut.", HttpStatus.CONFLICT),
    COURSE_ID_MUST_NOT_BE_NULL("COURSE-VALIDATION-002", "Kurs ID boş olamaz.", HttpStatus.BAD_REQUEST);
    // STUDENT_ALREADY_ENROLLED, STUDENT_NOT_ENROLLED kaldırıldı, CourseStudentValidationErrorCode'a taşındı.

    private final String code;
    private final String message;
    private final HttpStatus status;

    CourseValidationErrorCode(String code, String message, HttpStatus status) {
        this.code = code;
        this.message = message;
        this.status = status;
    }

}