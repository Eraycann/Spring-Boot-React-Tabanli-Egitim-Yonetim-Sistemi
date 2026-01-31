package org.kafka.examsystem.user.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User; // OAuth2User import'u
import java.util.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User implements UserDetails, OAuth2User { // Hem UserDetails hem de OAuth2User implemente ediyor

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String email;
    private String password;
    private String googleId; // Google OAuth2 için eklendi

    @ManyToOne
    @JoinColumn(name = "role_id")
    private Role role;

    // OAuth2User için eklenecek alanlar ve metotlar
    @Transient // Bu field'ın veritabanına map edilmesini engeller
    private Map<String, Object> attributes; // Google'dan gelen tüm öznitelikleri saklamak için

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority(role.getName()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    // --- OAuth2User Metotları ---

    @Override
    public <A> A getAttribute(String name) {
        return OAuth2User.super.getAttribute(name); // Default implementasyonunu kullanabiliriz
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes; // loadUser metodunda set ettiğimiz attributes'ı döneriz
    }

    // Google'da "sub" alanı genellikle kullanıcı ID'si olarak kabul edilir.
    // Eğer Google'dan gelen "name" veya "sub" özniteliğini kullanmak isterseniz
    // CustomOAuth2UserService'de oAuth2User.getName() veya oAuth2User.getAttribute("sub") ile alabilirsiniz.
    @Override
    public String getName() {
        // OAuth2User'ın getName() metodu genellikle kullanıcının benzersiz kimliğini döndürür.
        // Google için bu, 'sub' (subject) özniteliğidir.
        // Eğer email'i döndürmek isterseniz 'email' de dönebilirsiniz.
        // `CustomOAuth2UserService` içinde `oAuth2User.getName()` veya `oAuth2User.getAttribute("sub")` ile alınıyor.
        // Buraya doğrudan `googleId`'yi döndürebiliriz eğer Google ID'yi saklıyorsak.
        // Ya da Google'dan gelen orijinal 'sub' değerini döndürebiliriz.
        return googleId != null ? googleId : email; // GoogleId yoksa email dönebiliriz.
    }

    // Set attributes metodu CustomOAuth2UserService'de kullanmak için
    public void setAttributes(Map<String, Object> attributes) {
        this.attributes = attributes;
    }
}