package org.kafka.examsystem.course_student.service;

import org.kafka.examsystem.common.dto.PageResponse;
import org.kafka.examsystem.common.util.AuthUtil;
import org.kafka.examsystem.course.exception.domain.CourseDomainException; // CourseDomainException hala gerekli olabilir
import org.kafka.examsystem.course.model.Course;
import org.kafka.examsystem.course.repository.CourseRepository;
import org.kafka.examsystem.common.authorization.CourseAuthorizationService; // Doğru import
import org.kafka.examsystem.course_student.dto.CourseStudentSummaryDto;
import org.kafka.examsystem.course_student.dto.EnrolledCourseResponse;
import org.kafka.examsystem.course_student.mapper.CourseStudentSummaryMapper;
import org.kafka.examsystem.course_student.mapper.EnrolledCourseMapper;
import org.kafka.examsystem.course_student.model.CourseStudent;
import org.kafka.examsystem.course_student.repository.CourseStudentRepository;
import org.kafka.examsystem.course_student.service.validation.CourseStudentValidationService;
import org.kafka.examsystem.parent.model.Parent;
import org.kafka.examsystem.student.exception.domain.StudentDomainErrorCode; // StudentDomainErrorCode hala gerekli
import org.kafka.examsystem.student.exception.domain.StudentDomainException; // StudentDomainException hala gerekli
import org.kafka.examsystem.student.model.Student;
import org.kafka.examsystem.student.service.StudentService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

// Yeni hata importları
import org.kafka.examsystem.course_student.exception.domain.CourseStudentDomainErrorCode;
import org.kafka.examsystem.course_student.exception.domain.CourseStudentDomainException;
import org.kafka.examsystem.course_student.exception.validation.CourseStudentValidationErrorCode;
import org.kafka.examsystem.course_student.exception.validation.CourseStudentValidationException;


/**
 * Kurslara öğrenci kaydetme, kurstan çıkarma ve kursa kayıtlı öğrencileri listeleme işlemlerini yöneten servis.
 * Bu servis, Course ve Student varlıkları arasındaki CourseStudent ilişkisini doğrudan yönetir.
 */
@Service
@RequiredArgsConstructor
public class CourseEnrollmentService {

    private final CourseRepository courseRepository;
    private final StudentService studentService;
    private final CourseStudentRepository courseStudentRepository;
    private final CourseAuthorizationService courseAuthorizationService;
    private final EnrolledCourseMapper enrolledCourseMapper;
    private final CourseStudentSummaryMapper courseStudentSummaryMapper;
    private final CourseStudentValidationService courseStudentValidationService;

    /**
     * Belirli bir öğrenciyi belirli bir kursa kaydeder.
     * Yetkilendirme kontrolü CourseAuthorizationService'e delege edilmiştir.
     *
     * @param courseId Kaydedilecek kursun ID'si.
     * @param studentId Kaydedilecek öğrencinin ID'si.
     * @param currentUserId İşlemi yapan kullanıcının ID'si (yetkilendirme için).
     * @throws CourseStudentDomainException Kurs veya öğrenci bulunamazsa, yetkilendirme hatası olursa.
     * @throws CourseStudentValidationException Öğrenci zaten kursa kayıtlıysa veya ID'ler boşsa.
     */
    @Transactional
    public void enrollStudent(Long courseId, Long studentId, Long currentUserId) {
        // Doğrulama ve yetkilendirme CourseStudentValidationService'e delege edildi
        CourseStudentValidationService.CourseStudentPair pair =
                courseStudentValidationService.validateAndAuthorizeCourseStudentPair(courseId, studentId, currentUserId);
        Course course = pair.course();
        Student student = pair.student();

        if (courseStudentRepository.findByCourseAndStudent(course, student).isPresent()) {
            throw new CourseStudentValidationException(CourseStudentValidationErrorCode.STUDENT_ALREADY_ENROLLED);
        }

        CourseStudent courseStudent = new CourseStudent(course, student);
        courseStudentRepository.save(courseStudent);
    }

    /**
     * Belirli bir öğrenciyi belirli bir kurstan çıkarır.
     * Yetkilendirme kontrolü CourseAuthorizationService'e delege edilmiştir.
     *
     * @param courseId Çıkarılacak kursun ID'si.
     * @param studentId Çıkarılacak öğrencinin ID'si.
     * @param currentUserId İşlemi yapan kullanıcının ID'si (yetkilendirme için).
     * @throws CourseStudentDomainException Kurs veya öğrenci bulunamazsa, yetkilendirme hatası olursa.
     * @throws CourseStudentValidationException Öğrenci kursa kayıtlı değilse veya ID'ler boşsa.
     */
    @Transactional
    public void unenrollStudent(Long courseId, Long studentId, Long currentUserId) {
        CourseStudentValidationService.CourseStudentPair pair =
                courseStudentValidationService.validateAndAuthorizeCourseStudentPair(courseId, studentId, currentUserId);
        Course course = pair.course();
        Student student = pair.student();

        CourseStudent courseStudent = courseStudentRepository.findByCourseAndStudent(course, student)
                .orElseThrow(() -> new CourseStudentValidationException(CourseStudentValidationErrorCode.STUDENT_NOT_ENROLLED));

        courseStudentRepository.delete(courseStudent);
    }

    /**
     * Belirli bir kursa kayıtlı öğrencileri sayfalı olarak listeler.
     * Yetkilendirme kontrolü CourseAuthorizationService'e delege edilmiştir.
     *
     * @param courseId Kursun ID'si.
     * @param pageable Sayfalama bilgileri.
     * @param currentUserId İşlemi yapan kullanıcının ID'si (yetkilendirme için).
     * @return Kursa kayıtlı öğrencilerin sayfalı listesi.
     * @throws CourseStudentDomainException Kurs bulunamazsa veya yetkilendirme hatası olursa.
     * @throws CourseStudentValidationException Kurs ID'si boşsa.
     */
    @Transactional(readOnly = true)
    public PageResponse<CourseStudentSummaryDto> getStudentsByCourse(Long courseId, Pageable pageable, Long currentUserId) {
        if (courseId == null) {
            throw new CourseStudentValidationException(CourseStudentValidationErrorCode.COURSE_ID_MUST_NOT_BE_NULL);
        }

        Course course = courseRepository.findByIdWithTeacherAndUser(courseId)
                .orElseThrow(() -> new CourseStudentDomainException(CourseStudentDomainErrorCode.COURSE_NOT_FOUND));

        if (!courseAuthorizationService.canViewCourseStudents(course, currentUserId)) {
            throw new CourseStudentDomainException(CourseStudentDomainErrorCode.UNAUTHORIZED_COURSE_ACCESS);
        }

        Page<CourseStudent> courseStudentsPage = courseStudentRepository.findByCourseWithStudentAndUser(course, pageable);

        Page<CourseStudentSummaryDto> studentsSummaryPage = courseStudentsPage.map(cs -> courseStudentSummaryMapper.toCourseStudentSummaryDto(cs.getStudent()));
        return PageResponse.fromPage(courseStudentsPage, studentsSummaryPage.getContent());
    }

    /**
     * Belirli bir öğrencinin kayıtlı olduğu kursları sayfalı olarak getirir.
     * Sadece ROLE_STUDENT rolüne sahip kullanıcılar kendi kurslarını görebilir.
     * Bu metot, AuthUtil kullanarak mevcut kullanıcıyı bulur ve yetkilendirme yapar.
     * N+1 sorgu problemini önlemek için findByStudentWithCourseTeacherAndUser kullanılır.
     *
     * @param pageable Sayfalama bilgileri.
     * @return Öğrencinin kayıtlı olduğu kursların sayfalı listesi.
     * @throws StudentDomainException Öğrenci bulunamazsa veya yetkilendirme hatası olursa.
     */
    @Transactional(readOnly = true)
    public PageResponse<EnrolledCourseResponse> getEnrolledCoursesForCurrentStudent(Pageable pageable) {
        if (!AuthUtil.hasRole("ROLE_STUDENT")) {
            throw new StudentDomainException(StudentDomainErrorCode.UNAUTHORIZED_STUDENT_ACCESS);
        }

        Long currentUserId = AuthUtil.getCurrentUserId();
        if (currentUserId == null) {
            throw new StudentDomainException(StudentDomainErrorCode.UNAUTHORIZED_STUDENT_ACCESS);
        }

        Student currentStudent = studentService.getStudentByUserId(currentUserId);

        Page<CourseStudent> courseStudentsPage = courseStudentRepository.findByStudentWithCourseTeacherAndUser(currentStudent, pageable);

        Page<EnrolledCourseResponse> enrolledCourseResponsesPage = courseStudentsPage.map(cs -> enrolledCourseMapper.toEnrolledCourseResponse(cs.getCourse()));

        return PageResponse.fromPage(courseStudentsPage, enrolledCourseResponsesPage.getContent());
    }

    /**
     * Yardımcı metot: Belirli bir öğrenci kullanıcısının ID'sine sahip bir öğrencinin, belirli bir derse kayıtlı olup olmadığını kontrol eder.
     *
     * @param courseId Kontrol edilecek dersin ID'si.
     * @param studentUserId Kontrol edilecek öğrenci kullanıcısının ID'si.
     * @return Kayıtlıysa true, değilse false.
     */
    @Transactional(readOnly = true)
    public boolean isStudentEnrolledInCourse(Long courseId, Long studentUserId) {
        return courseStudentRepository.existsByCourseIdAndStudentUserId(courseId, studentUserId);
    }

    /**
     * Yardımcı metot: Belirli bir velinin öğrencisinin, belirli bir derse kayıtlı olup olmadığını kontrol eder.
     *
     * @param courseId Kontrol edilecek dersin ID'si.
     * @param parent Veli varlığı.
     * @return Eğer veliye ait herhangi bir öğrenci bu kursa kayıtlıysa true, aksi takdirde false.
     */
    @Transactional(readOnly = true)
    public boolean isParentOfEnrolledStudent(Long courseId, Parent parent) {
        return courseStudentRepository.existsByCourseIdAndStudentParent(courseId, parent);
    }
}
