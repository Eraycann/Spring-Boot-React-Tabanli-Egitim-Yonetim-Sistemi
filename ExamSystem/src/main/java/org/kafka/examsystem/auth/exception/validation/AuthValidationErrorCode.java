package org.kafka.examsystem.auth.exception.validation;


import lombok.Getter;
import org.kafka.examsystem.common.exception.base.BaseErrorCode;
import org.springframework.http.HttpStatus;

@Getter
public enum AuthValidationErrorCode implements BaseErrorCode {

    EMAIL_ALREADY_IN_USE("AUTH-VALID-001", "E-posta adresi zaten kullanımda.", HttpStatus.BAD_REQUEST),
    INVALID_REFRESH_TOKEN("AUTH-VALID-002", "Geçersiz veya bulunamayan yenileme tokenı.", HttpStatus.FORBIDDEN),
    REFRESH_TOKEN_EXPIRED("AUTH-VALID-003", "Yenileme tokenının süresi dolmuş. Lütfen tekrar giriş yapın.", HttpStatus.FORBIDDEN),
    USER_NOT_REGISTERED_WITH_GOOGLE_EMAIL("AUTH-VALID-004", "Bu e-posta adresiyle sistemde kayıtlı bir kullanıcı bulunamadı. Lütfen önce kayıt olun.", HttpStatus.UNAUTHORIZED);

    private final String code;
    private final String message;
    private final HttpStatus status;

    AuthValidationErrorCode(String code, String message, HttpStatus status) {
        this.code = code;
        this.message = message;
        this.status = status;
    }

}