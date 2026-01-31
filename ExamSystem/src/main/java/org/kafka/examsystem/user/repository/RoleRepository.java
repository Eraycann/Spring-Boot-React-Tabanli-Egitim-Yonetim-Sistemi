package org.kafka.examsystem.user.repository;

import org.kafka.examsystem.user.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Rol varlığı için JPA deposu.
 * Rol tabanlı işlemlerde (örn. rola göre arama) kullanılır.
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name); // Rol adına göre rol bulma
}