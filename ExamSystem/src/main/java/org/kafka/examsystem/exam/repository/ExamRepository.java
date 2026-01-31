package org.kafka.examsystem.exam.repository;

import org.kafka.examsystem.exam.model.Exam;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {

    /**
     * İlişkili ders bilgileri ile birlikte belirli bir sınavı getirir.
     * @param id Sınav ID'si.
     * @return Sınav nesnesi (Optional).
     */
    @Query("SELECT e FROM Exam e JOIN FETCH e.course c WHERE e.id = :id")
    Optional<Exam> findByIdWithCourse(@Param("id") Long id);

    /**
     * Sınav adı, aktiflik durumu ve ders ID'sine göre filtrelenmiş, sayfalı sınav listesini getirir.
     * Sorgu, N+1 problemini önlemek için JOIN FETCH kullanır.
     *
     * @param name Sınav adının bir kısmı (kısmi arama için, null olabilir).
     * @param isActive Aktiflik durumu (tam eşleşme için, null olabilir).
     * @param courseId Ders ID'si (tam eşleşme için, null olabilir).
     * @param pageable Sayfalama bilgileri.
     * @return Filtrelenmiş sınavların sayfalı listesi.
     */
    @Query("SELECT e FROM Exam e JOIN FETCH e.course c WHERE " +
            "LOWER(e.name) LIKE LOWER(CONCAT('%', COALESCE(:name, ''), '%')) AND " +
            "e.isActive = COALESCE(:isActive, e.isActive) AND " +
            "e.course.id = COALESCE(:courseId, e.course.id)")
    Page<Exam> searchExams(@Param("name") String name, @Param("isActive") Boolean isActive, @Param("courseId") Long courseId, Pageable pageable);

    /**
     * Belirli bir derse ait tüm sınavları getirir.
     * @param courseId Ders ID'si.
     * @return Sınav listesi.
     */
    Page<Exam> findByCourseId(Long courseId, Pageable pageable);
}
