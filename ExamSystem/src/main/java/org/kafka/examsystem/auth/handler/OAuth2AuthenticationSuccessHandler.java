package org.kafka.examsystem.auth.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.kafka.examsystem.auth.dto.AuthResponse;
import org.kafka.examsystem.auth.jwt.JwtService;
import org.kafka.examsystem.auth.service.RefreshTokenService;
import org.kafka.examsystem.auth.token.RefreshToken;
import org.kafka.examsystem.user.model.User;
import org.kafka.examsystem.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value; // @Value annotation'ı için
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.web.DefaultRedirectStrategy; // RedirectStrategy için
import org.springframework.security.web.RedirectStrategy; // RedirectStrategy için
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder; // URL oluşturmak için

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Optional;
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    @Value("${app.oauth2.redirectUri}") // Frontend'in yönlendirileceği URL
    private String redirectUri;

    private static final Logger logger = LoggerFactory.getLogger(OAuth2AuthenticationSuccessHandler.class);

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final RefreshTokenService refreshTokenService;
    private final RedirectStrategy redirectStrategy = new DefaultRedirectStrategy(); // Yönlendirme stratejisi


    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        logger.info("OAuth2AuthenticationSuccessHandler: onAuthenticationSuccess metodu çağrıldı.");
        logger.info("Authentication principal'ın tipi: {}", authentication.getPrincipal().getClass().getName());
        logger.info("Authentication principal: {}", authentication.getPrincipal());

        DefaultOidcUser oidcUser = (DefaultOidcUser) authentication.getPrincipal();
        String email = oidcUser.getAttribute("email");

        if (email == null) {
            logger.error("OAuth2 principal'dan email alınamadı. Frontend'e hata yönlendirmesi yapılıyor.");
            // Frontend'e hata mesajı ile yönlendirme yapabiliriz
            redirectStrategy.sendRedirect(request, response, redirectUri + "?error=email_not_found");
            return;
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            logger.error("Veritabanında email ile kullanıcı bulunamadı: {}. Frontend'e hata yönlendirmesi yapılıyor.", email);
            redirectStrategy.sendRedirect(request, response, redirectUri + "?error=user_not_registered");
            return;
        }

        User user = userOptional.get();
        logger.info("Veritabanından User objesi başarıyla alındı. Kullanıcı email: {}", user.getEmail());

        String accessToken = jwtService.generateToken(user);
        logger.info("JWT erişim tokenı başarıyla oluşturuldu.");

        RefreshToken refreshTokenEntity = refreshTokenService.createRefreshToken(user);
        String refreshToken = refreshTokenEntity.getToken();
        logger.info("Yenileme tokenı başarıyla oluşturuldu.");

        String role = user.getRole() != null ? user.getRole().getName() : "UNDEFINED_ROLE";
        logger.info("AuthResponse DTO'su hazırlandı. Kullanıcı email: {}, Rol: {}", email, role);

        // Frontend'e yönlendirilecek URL'yi oluştur
        // Bu URL, frontend uygulamanızdaki tokenları işleyecek bir rota olmalıdır.
        String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                .queryParam("accessToken", accessToken)
                .queryParam("refreshToken", refreshToken)
                .queryParam("email", email)
                .queryParam("role", role)
                .build().toUriString();

        logger.info("Frontend'e yönlendiriliyor: {}", targetUrl);
        redirectStrategy.sendRedirect(request, response, targetUrl); // Yönlendirme yap
    }
}