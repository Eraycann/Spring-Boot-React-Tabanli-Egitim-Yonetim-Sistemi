package org.kafka.examsystem.course.repository;

import jakarta.validation.constraints.NotBlank;
import org.kafka.examsystem.course.model.Course;
import org.kafka.examsystem.teacher.model.Teacher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;


/**
 * Kurs varlığı için JPA deposu.
 */
@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    /**
     * Belirli bir öğretmene ait kursları sayfalı olarak getirir.
     * Bu metot, Teacher nesnesinin kendisini parametre olarak alır.
     *
     * @param teacher Öğretmen nesnesi.
     * @param pageable Sayfalama bilgileri (sayfa numarası, sayfa boyutu, sıralama).
     * @return Öğretmene ait kursların sayfalı listesi.
     */
    @Query(value = "SELECT c FROM Course c JOIN FETCH c.teacher t JOIN FETCH t.user u WHERE t = :teacher",
            countQuery = "SELECT count(c) FROM Course c WHERE c.teacher = :teacher") // Sayfalama için countQuery gerekli
    Page<Course> findByTeacherWithTeacherAndUser(@Param("teacher") Teacher teacher, Pageable pageable);

    /**
     * Kursu, ilişkili öğretmen ve kullanıcı nesneleriyle birlikte tek sorguda getirir.
     * Bu, N+1 sorgu problemini önler ve yetkilendirme kontrolü için gerekli verileri sağlar.
     *
     * @param courseId Kursun ID'si.
     * @return İlişkili öğretmen ve kullanıcı bilgileriyle birlikte Course nesnesi.
     */
    @Query("SELECT c FROM Course c JOIN FETCH c.teacher t JOIN FETCH t.user u WHERE c.id = :courseId")
    Optional<Course> findByIdWithTeacherAndUser(@Param("courseId") Long courseId);

    /**
     * Tüm kursları, ilişkili öğretmen ve kullanıcı nesneleriyle birlikte sayfalı olarak getirir.
     * N+1 sorgu problemini önler.
     *
     * @param pageable Sayfalama bilgileri (sayfa numarası, sayfa boyutu, sıralama).
     * @return Tüm kursların sayfalı listesi.
     */
    @Query(value = "SELECT c FROM Course c JOIN FETCH c.teacher t JOIN FETCH t.user u",
            countQuery = "SELECT count(c) FROM Course c") // Sayfalama için countQuery gerekli
    Page<Course> findAllWithTeacherAndUser(Pageable pageable);

    /**
     * Kursları, isim ve sınıf seviyesi filtrelemesiyle sayfalı olarak getirir.
     * İsim filtresi kısmi eşleşme (LIKE) ve büyük/küçük harf duyarsızdır.
     * Sınıf seviyesi filtresi tam eşleşmedir ve opsiyoneldir (null ise uygulanmaz).
     * N+1 sorgu problemini önlemek için ilişkili öğretmen ve kullanıcı nesneleri JOIN FETCH ile birlikte getirilir.
     *
     * @param name       Kurs adının bir kısmı (LIKE operatörü ile kullanılır), null olabilir.
     * @param gradeLevel Kursun sınıf seviyesi (tam eşleşme), null olabilir.
     * @param pageable   Sayfalama bilgileri (sayfa numarası, sayfa boyutu, sıralama).
     * @return Filtrelenmiş kursların sayfalı listesi.

    @Query(value = "SELECT c FROM Course c JOIN FETCH c.teacher t JOIN FETCH t.user u " +
            "WHERE (:name IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%'))) " +
            "AND (:gradeLevel IS NULL OR c.gradeLevel = :gradeLevel)",
            countQuery = "SELECT count(c) FROM Course c " +
                    "WHERE (:name IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%'))) " +
                    "AND (:gradeLevel IS NULL OR c.gradeLevel = :gradeLevel)")
    Page<Course> searchCourses(@Param("name") String name,
                               @Param("gradeLevel") Integer gradeLevel,
                               Pageable pageable);
     */

    /**
     * Kursları, isim ve sınıf seviyesi filtrelemesiyle tek bir HQL sorgusu kullanarak sayfalı olarak getirir.
     * 'name' parametresi boş bırakıldığında tüm sonuçlar döndürülür.
     * Bu sorgu, veritabanı uyumsuzluklarını önlemek için COALESCE ve açık tip dönüşümü (CAST) kullanır.
     *
     * @param name       Kurs adının bir kısmı (LIKE operatörü ile kullanılır), null olabilir.
     * @param gradeLevel Kursun sınıf seviyesi (tam eşleşme), null olabilir.
     * @param pageable   Sayfalama bilgileri (sayfa numarası, sayfa boyutu, sıralama).
     * @return Filtrelenmiş kursların sayfalı listesi.
     */
    @Query(value = "SELECT c FROM Course c JOIN FETCH c.teacher t JOIN FETCH t.user u " +
            "WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', COALESCE(:name, ''), '%')) " +
            "AND (:gradeLevel IS NULL OR c.gradeLevel = :gradeLevel)")
    Page<Course> searchCourses(@Param("name") String name,
                               @Param("gradeLevel") Integer gradeLevel,
                               Pageable pageable);

}
