package org.kafka.examsystem.auth.service;

import org.kafka.examsystem.auth.exception.validation.AuthValidationException;
import org.kafka.examsystem.auth.exception.validation.AuthValidationErrorCode;
import org.kafka.examsystem.user.model.User;
import org.kafka.examsystem.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService; // Bu import'u kullanacağız, ama extends etmeyeceğiz
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService; // Bu import'u ekleyin
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
// *** BURAYI DİKKATLE DEĞİŞTİRİN ***
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private static final Logger logger = LoggerFactory.getLogger(CustomOAuth2UserService.class);

    private final UserRepository userRepository;
    // private final LdapRoleService ldapRoleService; // Eğer kullanıyorsanız
    // private final UserService userService; // Eğer kullanıyorsanız

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        logger.warn(">>> CustomOAuth2UserService.loadUser METHOD STARTING. This should be visible! <<<");

        // Ham OAuth2User bilgilerini almak için DefaultOAuth2UserService'i manuel olarak çağırıyoruz
        OAuth2User defaultOAuth2User = new DefaultOAuth2UserService().loadUser(userRequest);
        logger.info("DefaultOAuth2UserService'den gelen ham defaultOAuth2User tipi: {}", defaultOAuth2User.getClass().getName());
        logger.info("Ham defaultOAuth2User öznitelikleri: {}", defaultOAuth2User.getAttributes());

        String email = defaultOAuth2User.getAttribute("email");
        String googleId = defaultOAuth2User.getName(); // Genellikle Google'ın 'sub' ID'si

        Optional<User> existingUser = userRepository.findByEmail(email);

        User user;
        if (existingUser.isPresent()) {
            user = existingUser.get();
            logger.info("Kullanıcı veritabanında bulundu: {}", user.getEmail());
            if (user.getGoogleId() == null) {
                user.setGoogleId(googleId);
                userRepository.save(user);
                logger.info("Kullanıcının Google ID'si güncellendi: {}", googleId);
            }
            // *** Buraya defaultOAuth2User'ın tüm özniteliklerini set edin ***
            user.setAttributes(defaultOAuth2User.getAttributes());
            logger.info("Kullanıcıya Google öznitelikleri set edildi.");
        } else {
            logger.error("Hata: Google ile giriş yapan kullanıcı veritabanında bulunamadı: {}", email);
            throw new AuthValidationException(AuthValidationErrorCode.USER_NOT_REGISTERED_WITH_GOOGLE_EMAIL);
        }

        logger.info("loadUser metodundan dönen User objesinin tipi: {}", user.getClass().getName());
        logger.info("Dönen User objesi (email): {}", user.getEmail());
        logger.info("Dönen User objesi (OAuth2User attributes): {}", user.getAttributes());
        logger.warn(">>> CustomOAuth2UserService.loadUser METHOD ENDING. <<<");
        return user; // Kendi User objenizi döndürün
    }
}