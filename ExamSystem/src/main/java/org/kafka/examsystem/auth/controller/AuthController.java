package org.kafka.examsystem.auth.controller;

import org.kafka.examsystem.auth.dto.*;
import org.kafka.examsystem.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.kafka.examsystem.common.util.AuthUtil;
import org.kafka.examsystem.user.model.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth") // Kimlik doğrulama ile ilgili tüm endpoint'ler bu yol altında olacak
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService; // İş mantığını AuthController'a delege ediyoruz

    /**
     * Kullanıcı giriş endpoint'i.
     * İsteği AuthService'e delege eder ve JWT token, e-posta ve rolü içeren AuthResponse döndürür.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse response = authService.loginUser(loginRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Yenileme tokenı ile yeni bir erişim tokenı alma endpoint'i.
     * İsteği AuthService'e delege eder.
     */
    @PostMapping("/refresh-token")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest refreshTokenRequest) {
        AuthResponse response = authService.refreshAccessToken(refreshTokenRequest.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    /**
     * Veli ve Çocuk Kayıt endpoint'i.
     * İsteği AuthService'e delege eder.
     */
    @PostMapping("/register-parent")
    public ResponseEntity<String> registerParent(@Valid @RequestBody RegisterParentRequest registerParentRequest) {
        try {
            authService.registerParentAndStudent(registerParentRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body("Veli ve Öğrenci başarıyla kaydedildi!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Admin tarafından öğretmen kaydı endpoint'i.
     * Sadece ADMIN rolüne sahip kullanıcılar tarafından erişilebilir.
     * İsteği AuthService'e delege eder.
     */
    @PostMapping("/admin/teachers")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<String> registerTeacher(@Valid @RequestBody RegisterTeacherRequest registerTeacherRequest) {
        try {
            authService.registerTeacher(registerTeacherRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body("Öğretmen başarıyla Admin tarafından kaydedildi!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    /**
     * AuthUtil'deki metodları test etmek için örnek endpoint.
     * Bu endpoint'e erişmek için geçerli bir JWT token gereklidir.
     */
    @GetMapping("/test-auth-util")
    public ResponseEntity<Map<String, Object>> testAuthUtil() {
        Map<String, Object> userInfo = new HashMap<>();

        // AuthUtil metodlarını kullanarak bilgileri al
        User currentUser = AuthUtil.getCurrentUser();
        if (currentUser != null) {
            userInfo.put("currentUserId", AuthUtil.getCurrentUserId());
            userInfo.put("currentUserEmail", AuthUtil.getCurrentUserEmail());
            userInfo.put("currentUserRole", AuthUtil.getCurrentUserRole());
            userInfo.put("hasRole_ADMIN", AuthUtil.hasRole("ROLE_ADMIN"));
            userInfo.put("hasRole_TEACHER", AuthUtil.hasRole("ROLE_TEACHER"));
            userInfo.put("hasRole_PARENT", AuthUtil.hasRole("ROLE_PARENT"));
        } else {
            userInfo.put("message", "Kullanıcı kimliği doğrulanmamış veya anonim.");
        }

        return ResponseEntity.ok(userInfo);
    }
}
