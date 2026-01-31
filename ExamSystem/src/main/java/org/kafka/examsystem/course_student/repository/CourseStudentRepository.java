package org.kafka.examsystem.course_student.repository;

import org.kafka.examsystem.course.model.Course;
import org.kafka.examsystem.course_student.model.CourseStudent;
import org.kafka.examsystem.parent.model.Parent;
import org.kafka.examsystem.student.model.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * CourseStudent varlığı için JPA deposu.
 * Kurs ve öğrenci arasındaki kayıt ilişkilerini yönetir.
 */
@Repository
public interface CourseStudentRepository extends JpaRepository<CourseStudent, Long> { // ID tipi Long

    /**
     * Belirli bir kurs ve öğrenci arasındaki kaydı bulur.
     *
     * @param course Kurs varlığı.
     * @param student Öğrenci varlığı.
     * @return CourseStudent varlığı, eğer kayıt varsa.
     */
    Optional<CourseStudent> findByCourseAndStudent(Course course, Student student);

    /**
     * Belirli bir kursa kayıtlı öğrencileri sayfalı olarak getirir.
     * Öğrenci ve kullanıcı bilgileri JOIN FETCH ile birlikte getirilir.
     *
     * @param course Kurs varlığı.
     * @param pageable Sayfalama bilgileri.
     * @return Kursa kayıtlı öğrencilerin sayfalı listesi (CourseStudent nesneleri).
     */
    @Query(value = "SELECT cs FROM CourseStudent cs JOIN FETCH cs.student s JOIN FETCH s.user u WHERE cs.course = :course",
            countQuery = "SELECT count(cs) FROM CourseStudent cs WHERE cs.course = :course")
    Page<CourseStudent> findByCourseWithStudentAndUser(@Param("course") Course course, Pageable pageable);

    /**
     * Belirli bir öğrencinin kayıtlı olduğu kursları sayfalı olarak getirir.
     * Kurs, öğretmen ve kullanıcı bilgileri JOIN FETCH ile birlikte getirilir.
     *
     * @param student Öğrenci varlığı.
     * @param pageable Sayfalama bilgileri.
     * @return Öğrencinin kayıtlı olduğu kursların sayfalı listesi (CourseStudent nesneleri).
     */
    @Query(value = "SELECT cs FROM CourseStudent cs JOIN FETCH cs.course c JOIN FETCH c.teacher t JOIN FETCH t.user u WHERE cs.student = :student",
            countQuery = "SELECT count(cs) FROM CourseStudent cs WHERE cs.student = :student")
    Page<CourseStudent> findByStudentWithCourseTeacherAndUser(@Param("student") Student student, Pageable pageable);

    /**
     * Belirli bir kursa, belirli bir velinin öğrencisinin kayıtlı olup olmadığını kontrol eder.
     * Tek bir veritabanı sorgusu ile kontrol eder.
     *
     * @param courseId Kursun ID'si.
     * @param parent Veli varlığı.
     * @return Eğer veliye ait herhangi bir öğrenci bu kursa kayıtlıysa true, aksi takdirde false.
     */
    boolean existsByCourseIdAndStudentParent(Long courseId, Parent parent);

    /**
     * Belirli bir kurs ve öğrencinin, öğrenci kullanıcısının ID'sini kullanarak kayıtlı olup olmadığını kontrol eder.
     * Spring Data JPA'nın derived query özelliği sayesinde optimize edilmiş bir exists sorgusu oluşturur.
     *
     * @param courseId Kursun ID'si.
     * @param studentUserId Öğrenci kullanıcısının ID'si.
     * @return Eğer kayıt varsa true, yoksa false.
     */
    boolean existsByCourseIdAndStudentUserId(Long courseId, Long studentUserId);
}