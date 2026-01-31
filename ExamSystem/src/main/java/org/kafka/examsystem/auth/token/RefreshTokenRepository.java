package org.kafka.examsystem.auth.token;

import org.kafka.examsystem.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    Optional<RefreshToken> findByUser(User user); // Bir kullanıcıya ait refresh tokenı bulmak için
    void deleteByUser(User user); // Kullanıcıya ait refresh tokenı silmek için
}