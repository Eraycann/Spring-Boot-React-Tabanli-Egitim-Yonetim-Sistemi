package org.kafka.examsystem.course_student.exception.domain;

import lombok.Getter;
import org.kafka.examsystem.common.exception.base.BaseErrorCode;
import org.springframework.http.HttpStatus;

@Getter
public enum CourseStudentDomainErrorCode implements BaseErrorCode {


    UNAUTHORIZED_COURSE_ACCESS("FCOURSE-STUDENT-DOMAIN-001", "Bu kursa erişim yetkiniz yok.", HttpStatus.FORBIDDEN),
    COURSE_NOT_FOUND("COURSE-STUDENT-DOMAIN-002", "Belirtilen kurs bulunamadı.", HttpStatus.NOT_FOUND),
    STUDENT_NOT_FOUND("COURSE-STUDENT-DOMAIN-003", "Belirtilen öğrenci bulunamadı.", HttpStatus.NOT_FOUND),
    TEACHER_NOT_FOUND("COURSE-STUDENT-DOMAIN-004", "Belirtilen öğretmen bulunamadı.", HttpStatus.NOT_FOUND),
    PARENT_NOT_FOUND("COURSE-STUDENT-DOMAIN-005", "Belirtilen veli bulunamadı.", HttpStatus.NOT_FOUND),
    USER_NOT_FOUND("COURSE-STUDENT-DOMAIN-006", "Belirtilen kullanıcı bulunamadı.", HttpStatus.NOT_FOUND);


    private final String code;
    private final String message;
    private final HttpStatus status;

    CourseStudentDomainErrorCode(String code, String message, HttpStatus status) {
        this.code = code;
        this.message = message;
        this.status = status;
    }

}