package org.kafka.examsystem.user.repository;

import org.kafka.examsystem.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Kullanıcı varlığı için JPA deposu.
 * Kullanıcı tabanlı işlemlerde (örn. e-postaya göre arama, e-posta varlığı kontrolü) kullanılır.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
}