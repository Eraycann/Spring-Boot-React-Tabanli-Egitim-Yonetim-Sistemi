package org.kafka.examsystem.auth.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI (Swagger) dokümantasyonunu yapılandıran sınıf.
 * API bilgileri ve JWT güvenlik şeması tanımlanır.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth"; // JWT güvenlik şemasının adı

        return new OpenAPI()
                .info(new Info().title("Exam System API") // API'nızın başlığı
                        .description("Sınav Sistemi Uygulaması için RESTful API Dokümantasyonu") // API açıklaması
                        .version("1.0.0")) // API versiyonu
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName)) // Tüm endpoint'ler için güvenlik gereksinimini ekle
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP) // HTTP tabanlı güvenlik şeması
                                        .scheme("bearer") // Bearer token kullanıldığını belirtir
                                        .bearerFormat("JWT"))); // JWT formatında olduğunu belirtir
    }
}
