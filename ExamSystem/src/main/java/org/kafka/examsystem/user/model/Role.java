package org.kafka.examsystem.user.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Kullanıcı rolleri için JPA varlığı.
 * Sistemdeki farklı kullanıcı türlerini (ADMIN, TEACHER, PARENT) temsil eder.
 */
@Entity
@Table(name = "roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name; // Örn: "ROLE_ADMIN", "ROLE_TEACHER", "ROLE_PARENT"
}