package org.kafka.examsystem.auth.service;

import org.kafka.examsystem.auth.token.RefreshToken;
import org.kafka.examsystem.auth.token.RefreshTokenRepository;
import org.kafka.examsystem.user.model.User;
import org.kafka.examsystem.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    @Value("${application.security.jwt.refresh-token.expiration}")
    private long refreshTokenExpirationMs;

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    /**
     * Verilen kullanıcı için yeni bir refresh token oluşturur veya mevcutsa günceller.
     * Eğer kullanıcıya ait bir refresh token zaten varsa, onun token değeri ve son kullanma tarihi güncellenir.
     * Yoksa, yeni bir refresh token oluşturulur.
     *
     * @param user Refresh token oluşturulacak veya güncellenecek kullanıcı.
     * @return Oluşturulan veya güncellenen RefreshToken nesnesi.
     */
    @Transactional
    public RefreshToken createRefreshToken(User user) {
        // Kullanıcıya ait mevcut bir refresh token var mı kontrol et
        Optional<RefreshToken> existingToken = refreshTokenRepository.findByUser(user);

        RefreshToken refreshToken;
        if (existingToken.isPresent()) {
            // Mevcut token varsa, token değerini ve son kullanma tarihini güncelle
            refreshToken = existingToken.get();
            refreshToken.setToken(UUID.randomUUID().toString()); // Yeni bir rastgele token stringi oluştur
            refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenExpirationMs)); // Yeni son kullanma tarihini ayarla
        } else {
            // Mevcut token yoksa, yeni bir refresh token oluştur
            refreshToken = RefreshToken.builder()
                    .user(user)
                    .token(UUID.randomUUID().toString()) // Rastgele bir token stringi oluştur
                    .expiryDate(Instant.now().plusMillis(refreshTokenExpirationMs)) // Son kullanma tarihini ayarla
                    .build();
        }
        // Güncellenmiş veya yeni oluşturulmuş tokenı kaydet
        return refreshTokenRepository.save(refreshToken);
    }

    /**
     * Verilen refresh token stringini doğrular.
     *
     * @param token Doğrulanacak refresh token stringi.
     * @return Optional<RefreshToken> bulunan token nesnesi, yoksa boş.
     */
    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    /**
     * Refresh tokenın süresinin dolup dolmadığını kontrol eder.
     * Süresi dolmuşsa, tokenı veritabanından siler.
     *
     * @param token Kontrol edilecek RefreshToken nesnesi.
     * @return Süresi dolmuşsa true, aksi takdirde false.
     */
    @Transactional // Silme işlemi için transactional olmalı
    public boolean verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(token); // Süresi dolan tokenı sil
            return true; // Süresi dolmuş
        }
        return false; // Süresi dolmamış
    }

    /**
     * Kullanıcıya ait refresh tokenı siler (örneğin logout sırasında).
     * @param userId Refresh tokenı silinecek kullanıcı.
     */
    @Transactional
    public void deleteByUserId(Long userId) {
        userRepository.findById(userId).ifPresent(user -> refreshTokenRepository.deleteByUser(user));
    }
}
