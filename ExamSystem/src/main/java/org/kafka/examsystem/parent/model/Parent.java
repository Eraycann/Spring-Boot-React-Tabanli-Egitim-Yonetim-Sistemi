package org.kafka.examsystem.parent.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.kafka.examsystem.user.model.User;

/**
 * Veli varlığı. Bir User hesabına bağlıdır ve birden fazla öğrenciyi yönetebilir.
 */
@Entity
@Table(name = "parents")
@Data
@NoArgsConstructor
public class Parent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY) // Bir veli bir kullanıcıya karşılık gelir
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user; // Veliye bağlı kullanıcı hesabı

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;
}