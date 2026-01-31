package org.kafka.examsystem.course_student.controller;

import lombok.RequiredArgsConstructor;
import org.kafka.examsystem.common.dto.PageResponse;
import org.kafka.examsystem.course_student.dto.EnrolledCourseResponse;
import org.kafka.examsystem.course_student.service.CourseEnrollmentService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.kafka.examsystem.common.util.AuthUtil;
import org.kafka.examsystem.course_student.dto.CourseStudentSummaryDto;

/**
 * Kurs ve öğrenci arasındaki kayıt ilişkisiyle ilgili API isteklerini yöneten REST kontrolcü sınıfı.
 * Yetkilendirme ve sayfalama özelliklerini içerir.
 */
@RestController
@RequestMapping("/api/course-students")
@RequiredArgsConstructor
public class CourseStudentController {

    private final CourseEnrollmentService courseEnrollmentService;

    /**
     * Belirli bir öğrenciyi belirli bir kursa kaydeder.
     * Sadece ROLE_TEACHER veya ROLE_ADMIN rolüne sahip kullanıcılar bu işlemi yapabilir.
     * Yetkilendirme kontrolü CourseEnrollmentService'e delege edilmiştir.
     *
     * @param courseId Kaydedilecek kursun ID'si.
     * @param studentId Kaydedilecek öğrencinin ID'si.
     * @return HTTP 201 Created durumu.
     */
    @PostMapping("/{courseId}/students/{studentId}")
    @PreAuthorize("hasAnyRole('ROLE_TEACHER', 'ROLE_ADMIN')")
    public ResponseEntity<Void> enrollStudentToCourse(@PathVariable Long courseId, @PathVariable Long studentId) {
        Long currentUserId = AuthUtil.getCurrentUserId();
        courseEnrollmentService.enrollStudent(courseId, studentId, currentUserId);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    /**
     * Belirli bir öğrenciyi belirli bir kurstan çıkarır.
     * Sadece ROLE_TEACHER veya ROLE_ADMIN rolüne sahip kullanıcılar bu işlemi yapabilir.
     * Yetkilendirme kontrolü CourseEnrollmentService'e delege edilmiştir.
     *
     * @param courseId Çıkarılacak kursun ID'si.
     * @param studentId Çıkarılacak öğrencinin ID'si.
     * @return HTTP 204 No Content durumu.
     */
    @DeleteMapping("/{courseId}/students/{studentId}")
    @PreAuthorize("hasAnyRole('ROLE_TEACHER', 'ROLE_ADMIN')")
    public ResponseEntity<Void> unenrollStudentFromCourse(@PathVariable Long courseId, @PathVariable Long studentId) {
        Long currentUserId = AuthUtil.getCurrentUserId();
        courseEnrollmentService.unenrollStudent(courseId, studentId, currentUserId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Belirli bir kursa kayıtlı öğrencileri sayfalı olarak listeler.
     * Sadece kursun sahibi öğretmen, ADMIN veya kursa kayıtlı öğrencinin velisi görebilir.
     * Yetkilendirme kontrolü CourseEnrollmentService'e delege edilmiştir.
     *
     * @param courseId Kursun ID'si.
     * @param pageable Sayfalama bilgileri.
     * @return Kursa kayıtlı öğrencilerin sayfalı listesi ve HTTP 200 OK durumu.
     */
    @GetMapping("/{courseId}/students")
    @PreAuthorize("hasAnyRole('ROLE_TEACHER', 'ROLE_ADMIN', 'ROLE_PARENT', 'ROLE_STUDENT')")
    public ResponseEntity<PageResponse<CourseStudentSummaryDto>> getStudentsInCourse(
                                                                                      @PathVariable Long courseId,
                                                                                      @PageableDefault(size = 10, sort = "student.lastName", direction = Sort.Direction.ASC) Pageable pageable) {
        Long currentUserId = AuthUtil.getCurrentUserId();
        PageResponse<CourseStudentSummaryDto> students = courseEnrollmentService.getStudentsByCourse(courseId, pageable, currentUserId);
        return ResponseEntity.ok(students);
    }

    /**
     * Giriş yapmış öğrencinin kayıtlı olduğu kursları sayfalı olarak listeler.
     * Sadece ROLE_STUDENT rolüne sahip kullanıcılar kendi kurslarını görebilir.
     * Yetkilendirme kontrolü CourseEnrollmentService'e delege edilmiştir.
     *
     * @param pageable Sayfalama bilgileri.
     * @return Öğrencinin kayıtlı olduğu kursların sayfalı listesi ve HTTP 200 OK durumu.
     */
    @GetMapping("/me/enrolled-courses")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<PageResponse<EnrolledCourseResponse>> getEnrolledCoursesForCurrentStudent(
            @PageableDefault(size = 10, sort = "course.name", direction = Sort.Direction.ASC) Pageable pageable) {
        PageResponse<EnrolledCourseResponse> courses = courseEnrollmentService.getEnrolledCoursesForCurrentStudent(pageable);
        return ResponseEntity.ok(courses);
    }
}
