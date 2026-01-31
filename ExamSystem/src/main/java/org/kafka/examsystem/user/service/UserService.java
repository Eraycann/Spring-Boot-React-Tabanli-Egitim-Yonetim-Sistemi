package org.kafka.examsystem.user.service;

import lombok.RequiredArgsConstructor;
import org.kafka.examsystem.user.exception.domain.UserDomainErrorCode;
import org.kafka.examsystem.user.exception.domain.UserDomainException;
import org.kafka.examsystem.user.model.User;
import org.kafka.examsystem.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UserDomainException(UserDomainErrorCode.USER_NOT_FOUND));
    }

    @Transactional(readOnly = true)
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserDomainException(UserDomainErrorCode.USER_NOT_FOUND));
    }
}
