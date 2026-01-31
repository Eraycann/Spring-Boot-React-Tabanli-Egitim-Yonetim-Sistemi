package org.kafka.examsystem.exam_submission.exception.domain;

import lombok.Getter;
import org.kafka.examsystem.common.exception.base.BaseErrorCode;
import org.springframework.http.HttpStatus;

@Getter
public enum ExamSubmissionDomainErrorCode implements BaseErrorCode {

    NOT_ENROLLED_IN_COURSE("EXAM-SUBMISSION-DOMAIN-001", "Öğrenci bu derse kayıtlı değil.", HttpStatus.FORBIDDEN),
    ACTIVE_SUBMISSION_ALREADY_EXISTS("EXAM-SUBMISSION-DOMAIN-002", "Bu sınava zaten aktif bir girişiniz var.", HttpStatus.CONFLICT),
    SUBMISSION_NOT_FOUND("EXAM-SUBMISSION-DOMAIN-003", "Sınav girişi bulunamadı.", HttpStatus.NOT_FOUND),
    UNAUTHORIZED_SUBMISSION_ACCESS("EXAM-SUBMISSION-DOMAIN-004", "Sınav girişine erişim yetkiniz yok.", HttpStatus.FORBIDDEN),
    SUBMISSION_ALREADY_COMPLETED("EXAM-SUBMISSION-DOMAIN-005", "Bu sınav zaten tamamlanmış.", HttpStatus.CONFLICT);

    private final String code;
    private final String message;
    private final HttpStatus status;

    ExamSubmissionDomainErrorCode(String code, String message, HttpStatus status) {
        this.code = code;
        this.message = message;
        this.status = status;
    }

}