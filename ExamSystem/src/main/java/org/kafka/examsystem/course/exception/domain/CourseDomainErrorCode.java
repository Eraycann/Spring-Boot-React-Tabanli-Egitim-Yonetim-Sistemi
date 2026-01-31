package org.kafka.examsystem.course.exception.domain;

import lombok.Getter;
import org.kafka.examsystem.common.exception.base.BaseErrorCode;
import org.springframework.http.HttpStatus;

@Getter
public enum CourseDomainErrorCode implements BaseErrorCode {

    TEACHER_NOT_FOUND("COURSE-DOMAIN-001", "Belirtilen öğretmen bulunamadı.", HttpStatus.NOT_FOUND),
    COURSE_NOT_FOUND("COURSE-DOMAIN-002", "Kurs bulunamadı.", HttpStatus.NOT_FOUND),
    UNAUTHORIZED_COURSE_ACCESS("COURSE-DOMAIN-003", "Bu kursa erişim yetkiniz yok.", HttpStatus.FORBIDDEN);
    // STUDENT_NOT_FOUND, PARENT_NOT_FOUND, USER_NOT_FOUND kaldırıldı, CourseStudentDomainErrorCode'a taşındı.

    private final String code;
    private final String message;
    private final HttpStatus status;

    CourseDomainErrorCode(String code, String message, HttpStatus status) {
        this.code = code;
        this.message = message;
        this.status = status;
    }

}