package org.kafka.examsystem.parent.repository;

import org.kafka.examsystem.parent.model.Parent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Veli varlığı için JPA deposu.
 */
@Repository
public interface ParentRepository extends JpaRepository<Parent, Long> {

    Optional<Parent> findByUserId(Long userId);
}