package org.kafka.examsystem.student.repository;

import org.kafka.examsystem.parent.model.Parent;
import org.kafka.examsystem.student.model.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Öğrenci varlığı için JPA deposu.
 */
@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByUserId(Long userId);

    /**
     * Belirli bir veliye ait tüm öğrencileri getirir.
     * Bu metot, veli rolüne sahip kullanıcıların çocuklarının sınav girişlerini görmesi için kullanılır.
     * @param parent Veli nesnesi.
     * @return Veliye ait öğrencilerin listesi.
     */
    List<Student> findByParent(Parent parent);

    /**
     * Öğrencileri ad, soyad ve sınıf düzeyine göre arar.
     * Parametreler null olabilir; COALESCE fonksiyonu null değerleri boş dizeye veya
     * kendi değerine dönüştürerek dinamik bir sorgu oluşturur.
     *
     * @param firstName Öğrenci adının bir kısmı (kısmi arama için, null olabilir).
     * @param lastName Öğrenci soyadının bir kısmı (kısmi arama için, null olabilir).
     * @param gradeLevel Öğrencinin sınıf düzeyi (tam eşleşme için, null olabilir).
     * @param pageable Sayfalama ve sıralama bilgileri.
     * @return Arama kriterlerine uyan öğrencilerin sayfalı listesi.
     */
    @Query("SELECT s FROM Student s WHERE " +
            "LOWER(s.firstName) LIKE LOWER(CONCAT('%', COALESCE(:firstName, ''), '%')) AND " +
            "LOWER(s.lastName) LIKE LOWER(CONCAT('%', COALESCE(:lastName, ''), '%')) AND " +
            "s.gradeLevel = COALESCE(:gradeLevel, s.gradeLevel)")
    Page<Student> searchStudents(
            @Param("firstName") String firstName,
            @Param("lastName") String lastName,
            @Param("gradeLevel") Integer gradeLevel,
            Pageable pageable);
}