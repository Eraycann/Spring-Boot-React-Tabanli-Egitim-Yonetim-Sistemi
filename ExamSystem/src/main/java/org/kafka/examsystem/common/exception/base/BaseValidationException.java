package org.kafka.examsystem.common.exception.base;

public class BaseValidationException extends RuntimeException {
    private final BaseErrorCode errorCode;

    public BaseValidationException(BaseErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public BaseErrorCode getErrorCode() {
        return errorCode;
    }
}