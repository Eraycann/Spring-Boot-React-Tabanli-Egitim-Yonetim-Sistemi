package org.kafka.examsystem.common.authorization;

import lombok.RequiredArgsConstructor;
import org.kafka.examsystem.common.util.AuthUtil;
import org.kafka.examsystem.course.model.Course;
import org.kafka.examsystem.course_student.repository.CourseStudentRepository;
import org.kafka.examsystem.course_student.service.CourseEnrollmentService;
import org.kafka.examsystem.parent.exception.domain.ParentDomainErrorCode;
import org.kafka.examsystem.parent.exception.domain.ParentDomainException;
import org.kafka.examsystem.parent.model.Parent;
import org.kafka.examsystem.parent.service.ParentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Kurslarla ilgili yetkilendirme kontrollerini yöneten servis.
 * Bu servis, bir kullanıcının belirli bir kursa veya onunla ilgili verilere erişim yetkisini kontrol eder.
 */
@Service
@RequiredArgsConstructor
public class CourseAuthorizationService {

    private final ParentService parentService;
    // private final CourseEnrollmentService courseEnrollmentService;
    private final CourseStudentRepository courseStudentRepository;

    /**
     * Kullanıcının belirli bir kursun öğrencilerini görme yetkisine sahip olup olmadığını kontrol eder.
     * Bu yetkiye sahip olmak için:
     * 1. Kursun öğretmeni olmak, VEYA
     * 2. ADMIN rolüne sahip olmak, VEYA
     * 3. Kursa kayıtlı öğrencilerden herhangi birinin velisi olmak, VEYA
     * 4. Kursa kayıtlı bir öğrenci olmak.
     *
     * @param course Kurs varlığı.
     * @param currentUserId Mevcut kullanıcının ID'si.
     * @return Kullanıcının yetkisi varsa true, aksi takdirde false.
     */
    @Transactional(readOnly = true)
    public boolean canViewCourseStudents(Course course, Long currentUserId) {
        if (currentUserId == null) {
            return false;
        }

        // 1. ADMIN rol kontrolü
        if (AuthUtil.hasRole("ROLE_ADMIN")) {
            return true;
        }

        // 2. Kursun öğretmeni olma kontrolü
        if (course.getTeacher() != null && course.getTeacher().getUser() != null &&
                course.getTeacher().getUser().getId().equals(currentUserId)) {
            return true;
        }

        // 3. Kursa kayıtlı öğrencilerden herhangi birinin velisi olma kontrolü
        if (AuthUtil.hasRole("ROLE_PARENT")) {
            try {
                Parent currentParent = parentService.getParentByUserId(currentUserId);
                courseStudentRepository.existsByCourseIdAndStudentParent(course.getId(), currentParent);
                // return courseEnrollmentService.isParentOfEnrolledStudent(course.getId(), currentParent);
            } catch (ParentDomainException e) { // TODO: throw new AccessDeniedException fırlatılabilirdi. 403 olarak işlenirdi.
                throw new ParentDomainException(ParentDomainErrorCode.UNAUTHORIZED_PARENT_ACCESS);
            }
        }

        // 4. Kursa kayıtlı öğrenci olma kontrolü
        if (AuthUtil.hasRole("ROLE_STUDENT")) {
            return courseStudentRepository.existsByCourseIdAndStudentUserId(course.getId(), currentUserId);
        }

        return false;
    }

    /**
     * Kullanıcının bir kursu güncelleme, silme, öğrenci kaydetme veya çıkarma yetkisine sahip olup olmadığını kontrol eder.
     * Bu yetkiye sahip olmak için:
     * 1. Kursun öğretmeni olmak, VEYA
     * 2. ADMIN rolüne sahip olmak.
     *
     * @param course Kurs varlığı.
     * @param currentUserId Mevcut kullanıcının ID'si.
     * @return Kullanıcının yetkisi varsa true, aksi takdirde false.
     */
    public boolean canModifyCourse(Course course, Long currentUserId) {
        if (currentUserId == null) {
            return false;
        }
        boolean isAdmin = AuthUtil.hasRole("ROLE_ADMIN");
        boolean isTeacherOfCourse = course.getTeacher() != null && course.getTeacher().getUser() != null &&
                course.getTeacher().getUser().getId().equals(currentUserId);
        return isAdmin || isTeacherOfCourse;
    }

    /**
     * Kullanıcının bir kursun içeriğini (sınavlar, sorular, konular) görme yetkisine sahip olup olmadığını kontrol eder.
     * Bu yetkiye sahip olmak için:
     * 1. Kursun öğretmeni olmak, VEYA
     * 2. ADMIN rolüne sahip olmak, VEYA
     * 3. Kursa kayıtlı bir öğrenci olmak.
     *
     * @param course Kurs varlığı.
     * @param currentUserId Mevcut kullanıcının ID'si.
     * @return Kullanıcının yetkisi varsa true, aksi takdirde false.
     */
    @Transactional(readOnly = true)
    public boolean canViewCourseContent(Course course, Long currentUserId) {
        if (currentUserId == null) {
            return false;
        }

        // 1. ADMIN rol kontrolü
        if (AuthUtil.hasRole("ROLE_ADMIN")) {
            return true;
        }

        // 2. Kursun öğretmeni olma kontrolü
        if (course.getTeacher() != null && course.getTeacher().getUser() != null &&
                course.getTeacher().getUser().getId().equals(currentUserId)) {
            return true;
        }

        // 3. Kursa kayıtlı öğrenci olma kontrolü
        if (AuthUtil.hasRole("ROLE_STUDENT")) {
            return courseStudentRepository.existsByCourseIdAndStudentUserId(course.getId(), currentUserId);
            // return courseEnrollmentService.isStudentEnrolledInCourse(course.getId(), currentUserId);
        }

        return false;
    }
}
