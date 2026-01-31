package org.kafka.examsystem.auth.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${application.security.jwt.secret-key}")
    private String secretKey; // JWT imzalama için kullanılan gizli anahtar
    @Value("${application.security.jwt.expiration}")
    private long jwtExpiration; // JWT'nin geçerlilik süresi (milisaniye)

    /**
     * Verilen JWT token'ından kullanıcı adını (subject) çıkarır.
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Belirli bir claim'i JWT token'ından çıkarır.
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Kullanıcı detaylarına göre yeni bir JWT token oluşturur.
     */
    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    /**
     * Ekstra claim'ler ve kullanıcı detaylarına göre yeni bir JWT token oluşturur.
     */
    public String generateToken(
            Map<String, Object> extraClaims,
            UserDetails userDetails
    ) {
        return Jwts
                .builder()
                .setClaims(extraClaims) // Ekstra claim'leri (örneğin rol) ayarla
                .setSubject(userDetails.getUsername()) // Token'ın konusu (genellikle kullanıcı e-postası)
                .setIssuedAt(new Date(System.currentTimeMillis())) // Token'ın oluşturulma zamanı
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration)) // Token'ın bitiş zamanı
                .signWith(getSignInKey(), SignatureAlgorithm.HS256) // İmzalama anahtarı ve algoritması (HS256)
                .compact(); // Token'ı sıkıştır ve string olarak döndür
    }

    /**
     * Bir JWT token'ının geçerliliğini kontrol eder.
     * Kullanıcı adı eşleşmeli ve token'ın süresi dolmamış olmalı.
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    /**
     * Bir JWT token'ının süresinin dolup dolmadığını kontrol eder.
     */
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Bir JWT token'ından bitiş zamanını çıkarır.
     */
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Bir JWT token'ındaki tüm claim'leri çıkarır.
     * Bu, token'ın imzasını doğrular ve içindeki verileri ayrıştırır.
     */
    private Claims extractAllClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * JWT imzalama için kullanılan gizli anahtarı döndürür.
     * Anahtar base64 olarak kodlanmış string'den türetilir.
     */
    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}