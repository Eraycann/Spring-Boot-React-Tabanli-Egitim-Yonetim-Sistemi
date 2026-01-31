package org.kafka.examsystem.auth.service;

import lombok.RequiredArgsConstructor;
import org.kafka.examsystem.user.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

// Spring Security'nin UserDetailsService arayüzünü uygulayan servis
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Verilen kullanıcı adı (bu durumda e-posta) ile kullanıcı detaylarını veritabanından yükler.
     * Spring Security bu metodu kimlik doğrulama sırasında kullanıcı bilgilerini almak için kullanır.
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // E-postaya göre kullanıcıyı bulur, bulunamazsa UsernameNotFoundException fırlatır.
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }
}