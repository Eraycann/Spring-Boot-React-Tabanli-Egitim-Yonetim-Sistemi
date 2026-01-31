package org.kafka.examsystem.topic.repository;

import org.kafka.examsystem.topic.model.Topic;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {

    /**
     * İlişkili kurs bilgileri ile birlikte belirli bir konuyu getirir.
     * @param id Konu ID'si.
     * @return Konu nesnesi (Optional).
     */
    @Query("SELECT t FROM Topic t JOIN FETCH t.course c WHERE t.id = :id")
    Optional<Topic> findByIdWithCourse(@Param("id") Long id);

    /**
     * Konu adı ve kurs ID'sine göre filtrelenmiş, sayfalı konu listesini getirir.
     * Sorgu, N+1 problemini önlemek için JOIN FETCH kullanır.
     * @param name Konu adının bir kısmı (kısmi arama için, null olabilir).
     * @param courseId Kurs ID'si (tam eşleşme için, null olabilir).
     * @param pageable Sayfalama bilgileri.
     * @return Filtrelenmiş konuların sayfalı listesi.
     */
    @Query("SELECT t FROM Topic t JOIN FETCH t.course c WHERE " +
            "LOWER(t.name) LIKE LOWER(CONCAT('%', COALESCE(:name, ''), '%')) AND " +
            "(:courseId IS NULL OR t.course.id = :courseId)")
    Page<Topic> searchTopics(@Param("name") String name, @Param("courseId") Long courseId, Pageable pageable);

    /**
     * Belirli bir kursa ait tüm konuları getirir.
     * @param courseId Kurs ID'si.
     * @return Konu listesi.
     */
    Page<Topic> findByCourseId(Long courseId, Pageable pageable);
}
