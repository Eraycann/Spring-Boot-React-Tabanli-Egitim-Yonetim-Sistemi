package org.kafka.examsystem.course_student.service.validation;

import lombok.RequiredArgsConstructor;
import org.kafka.examsystem.course.exception.domain.CourseDomainErrorCode;
import org.kafka.examsystem.course.exception.domain.CourseDomainException;
import org.kafka.examsystem.course.exception.validation.CourseValidationErrorCode;
import org.kafka.examsystem.course.exception.validation.CourseValidationException;
import org.kafka.examsystem.course.model.Course;
// import org.kafka.examsystem.course.repository.CourseRepository; // Artık buna gerek yok
import org.kafka.examsystem.course.service.CourseService; // CourseService import edildi
import org.kafka.examsystem.common.authorization.CourseAuthorizationService;
import org.kafka.examsystem.student.model.Student;
import org.kafka.examsystem.student.service.StudentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Kurs ve öğrenci kayıt işlemleri için varlık doğrulama ve yetkilendirme kontrollerini yöneten servis.
 * Bu servis, ilgili varlıkları çeker ve yetkilendirme kontrolünü başlatır.
 */
@Service
@RequiredArgsConstructor
public class CourseStudentValidationService {

    // private final CourseRepository courseRepository; // Bağımlılık kaldırıldı
    private final CourseService courseService; // Yeni bağımlılık
    private final StudentService studentService;
    private final CourseAuthorizationService courseAuthorizationService;

    /**
     * Kurs ve öğrenci varlıklarını doğrular, çeker ve yetkilendirme kontrolünü yapar.
     * Bu metot, kayıt ve çıkarma işlemleri için ortak bir ön kontrol noktası sağlar.
     *
     * @param courseId Kaydedilecek/çıkarılacak kursun ID'si.
     * @param studentId Kaydedilecek/çıkarılacak öğrencinin ID'si.
     * @param currentUserId İşlemi yapan kullanıcının ID'si (yetkilendirme için).
     * @return Doğrulanmış Course ve Student varlıklarını içeren bir ikili.
     * @throws CourseValidationException ID'ler boşsa.
     * @throws CourseDomainException Kurs veya öğrenci bulunamazsa, yetkilendirme hatası olursa.
     */
    @Transactional(readOnly = true)
    public CourseStudentPair validateAndAuthorizeCourseStudentPair(Long courseId, Long studentId, Long currentUserId) {
        if (courseId == null) {
            throw new CourseValidationException(CourseValidationErrorCode.COURSE_ID_MUST_NOT_BE_NULL);
        }

        Course course = courseService.getCourseByIdWithTeacherAndUser(courseId);

        Student student = studentService.getStudentById(studentId);

        if (!courseAuthorizationService.canModifyCourse(course, currentUserId)) {
            throw new CourseDomainException(CourseDomainErrorCode.UNAUTHORIZED_COURSE_ACCESS);
        }

        return new CourseStudentPair(course, student);
    }

    /**
     * Kurs ve Öğrenci varlıklarını bir arada tutmak için kullanılan basit bir record sınıfı.
     */
    public record CourseStudentPair(Course course, Student student) {}
}
