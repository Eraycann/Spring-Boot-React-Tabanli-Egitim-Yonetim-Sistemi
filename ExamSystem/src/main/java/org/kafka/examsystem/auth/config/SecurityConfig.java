package org.kafka.examsystem.auth.config;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.kafka.examsystem.auth.handler.OAuth2AuthenticationSuccessHandler;
import org.kafka.examsystem.auth.jwt.AuthEntryPointJwt;
import org.kafka.examsystem.auth.jwt.JwtAuthenticationFilter;
import org.kafka.examsystem.auth.service.CustomOAuth2UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // @PreAuthorize anotasyonlarını etkinleştirir
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final AuthenticationProvider authenticationProvider;
    private final AuthEntryPointJwt unauthorizedHandler;
    private final CustomOAuth2UserService customOAuth2UserService; // Bağımlılık eklendi
    private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler; // Bağımlılık eklendi

    /**
     * Güvenlik filtre zincirini tanımlar.
     * API endpoint'leri için erişim kurallarını ve JWT filtresinin nasıl kullanılacağını yapılandırır.
     * OAuth2 girişini de etkinleştirir.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable) // CSRF korumasını REST API'leri için devre dışı bırak
                .cors(Customizer.withDefaults()) // CORS'u etkinleştir ve corsConfigurationSource bean'ini kullan
                .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler)) // Yetkilendirme hatalarını yönetir (401 Unauthorized)
                .authorizeHttpRequests(auth -> auth

                        .requestMatchers("/api/auth/login").permitAll()
                        .requestMatchers("/api/auth/register-parent").permitAll()
                        .requestMatchers("/api/auth/refresh-token").permitAll()

                        .requestMatchers("/oauth2/**").permitAll()
                        .requestMatchers("/login/oauth2/code/**").permitAll()

                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()

                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Oturum yönetimini durumsuz (stateless) yap (JWT için gerekli)
                .authenticationProvider(authenticationProvider) // Geleneksel kimlik doğrulama sağlayıcısını ayarla
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class) // JWT filtresini standart kullanıcı adı/şifre filtresinden önce ekle
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(customOAuth2UserService) // Bu satır sizin CustomOAuth2UserService'inizi kullanmalı
                        )
                        .successHandler(oAuth2AuthenticationSuccessHandler)
                        .failureHandler((request, response, exception) -> {
                            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "OAuth2 giriş başarısız: " + exception.getMessage());
                        })
                );

        return http.build();
    }

    // CORS konfigürasyonu için Bean
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Frontend uygulamanızın URL'sini buraya ekleyin
        // Vite'ın varsayılan portu 5173'tür.
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        // İzin verilen HTTP metotları
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // İzin verilen başlıklar (Authorization başlığı JWT için kritik)
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
        // Kimlik bilgileri (credentials) ile istek gönderilmesine izin ver (cookie, Authorization başlığı vb.)
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Tüm yollara (/**) bu CORS konfigürasyonunu uygula
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
