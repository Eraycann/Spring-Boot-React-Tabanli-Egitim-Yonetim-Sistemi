package org.kafka.examsystem;

import org.kafka.examsystem.user.model.Role;
import org.kafka.examsystem.user.model.User;
import org.kafka.examsystem.user.repository.RoleRepository;
import org.kafka.examsystem.user.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

@SpringBootApplication
public class ExamSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(ExamSystemApplication.class, args);
    }

    /**
     * Uygulama başlangıcında rollerin (ROLE_ADMIN, ROLE_TEACHER, ROLE_PARENT, ROLE_STUDENT) ve
     * bir varsayılan admin kullanıcısının veritabanına eklenmesini sağlar.
     */
    @Bean
    CommandLineRunner initDatabase(RoleRepository roleRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Roller kontrol ediliyor ve yoksa oluşturuluyor
            if (roleRepository.findByName("ROLE_ADMIN").isEmpty()) {
                roleRepository.save(new Role(null, "ROLE_ADMIN"));
            }
            if (roleRepository.findByName("ROLE_TEACHER").isEmpty()) {
                roleRepository.save(new Role(null, "ROLE_TEACHER"));
            }
            if (roleRepository.findByName("ROLE_PARENT").isEmpty()) {
                roleRepository.save(new Role(null, "ROLE_PARENT"));
            }
            if (roleRepository.findByName("ROLE_STUDENT").isEmpty()) {
                roleRepository.save(new Role(null, "ROLE_STUDENT"));
            }

            // Admin kullanıcısı kontrol ediliyor ve yoksa oluşturuluyor
            Optional<User> adminUser = userRepository.findByEmail("admin@example.com");
            if (adminUser.isEmpty()) {
                Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                        .orElseThrow(() -> new RuntimeException("Error: Admin Role not found. Please ensure roles are initialized."));

                User admin = new User();
                admin.setEmail("admin@example.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole(adminRole);
                userRepository.save(admin);
                System.out.println("Admin user created: admin@example.com with password 'admin123'");
            }
        };
    }
}
