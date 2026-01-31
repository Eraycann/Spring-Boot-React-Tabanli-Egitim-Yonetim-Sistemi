package org.kafka.examsystem.teacher.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.kafka.examsystem.user.model.User;

/**
 * Öğretmen varlığı. Bir User hesabına bağlıdır ve kursları öğretebilir.
 */
@Entity
@Table(name = "teachers")
@Data
@NoArgsConstructor
public class Teacher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String branch;
}