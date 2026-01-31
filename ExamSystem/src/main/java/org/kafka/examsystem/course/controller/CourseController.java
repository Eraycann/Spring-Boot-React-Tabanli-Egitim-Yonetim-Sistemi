package org.kafka.examsystem.course.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.kafka.examsystem.common.dto.PageResponse;
import org.kafka.examsystem.course.dto.CourseCreateRequest;
import org.kafka.examsystem.course.dto.CourseResponse;
import org.kafka.examsystem.course.dto.CourseUpdateRequest;
import org.kafka.examsystem.course.service.CourseService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Kurslarla ilgili API isteklerini yöneten REST kontrolcü sınıfı.
 * Yetkilendirme, doğrulama ve sayfalama özelliklerini içerir.
 */
@RestController
@RequestMapping("/api/courses") // Tüm endpoint'ler için temel yol
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    /**
     * Yeni bir kurs oluşturur.
     * Sadece ROLE_TEACHER rolüne sahip kullanıcılar kurs oluşturabilir.
     *
     * @param request Kurs oluşturma isteği DTO'su.
     * @return Oluşturulan kursun yanıt DTO'su ve HTTP 201 Created durumu.
     */
    @PostMapping
    @PreAuthorize("hasRole('ROLE_TEACHER')") // Sadece öğretmenler kurs oluşturabilir
    public ResponseEntity<CourseResponse> createCourse(@Valid @RequestBody CourseCreateRequest request) {
        CourseResponse response = courseService.createCourse(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Mevcut bir kursu günceller.
     * Sadece kursu oluşturan öğretmen veya ADMIN rolüne sahip kullanıcılar güncelleyebilir.
     * Yetkilendirme kontrolü servis katmanında yapılır (kursun sahibinin kontrolü).
     *
     * @param courseId Güncellenecek kursun ID'si.
     * @param request Kurs güncelleme isteği DTO'su.
     * @return Güncellenen kursun yanıt DTO'su ve HTTP 200 OK durumu.
     */
    @PutMapping("/{courseId}")
    @PreAuthorize("hasAnyRole('ROLE_TEACHER', 'ROLE_ADMIN')") // Öğretmenler veya Adminler güncelleyebilir
    public ResponseEntity<CourseResponse> updateCourse(@PathVariable Long courseId,
                                                       @Valid @RequestBody CourseUpdateRequest request) {
        CourseResponse response = courseService.updateCourse(courseId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Bir kursu siler.
     * Sadece kursu oluşturan öğretmen veya ADMIN rolüne sahip kullanıcılar silebilir.
     * Yetkilendirme kontrolü servis katmanında yapılır (kursun sahibinin kontrolü).
     *
     * @param courseId Silinecek kursun ID'si.
     * @return HTTP 204 No Content durumu.
     */
    @DeleteMapping("/{courseId}")
    @PreAuthorize("hasAnyRole('ROLE_TEACHER', 'ROLE_ADMIN')") // Öğretmenler veya Adminler silebilir
    public ResponseEntity<Void> deleteCourse(@PathVariable Long courseId) {
        courseService.deleteCourse(courseId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Tüm kursları sayfalı olarak listeler.
     * Herkes erişebilir (yetkilendirme gerektirmez).
     * Varsayılan olarak sayfa boyutu 10, kurs adına göre artan sıralama.
     *
     * @param pageable Sayfalama ve sıralama bilgileri.
     * @return Kurs yanıt DTO'larının sayfalı listesi ve HTTP 200 OK durumu.
     */
    @GetMapping
    public ResponseEntity<PageResponse<CourseResponse>> getAllCourses(
            @PageableDefault(size = 10, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        PageResponse<CourseResponse> courses = courseService.getAllCourses(pageable);
        return ResponseEntity.ok(courses);
    }

    /**
     * Belirli bir ID'ye sahip kursu getirir.
     * Herkes erişebilir (yetkilendirme gerektirmez).
     *
     * @param courseId Kursun ID'si.
     * @return Kurs yanıt DTO'su ve HTTP 200 OK durumu.
     */
    @GetMapping("/{courseId}")
    public ResponseEntity<CourseResponse> getCourseById(@PathVariable Long courseId) {
        CourseResponse response = courseService.getCourseResponseById(courseId);
        return ResponseEntity.ok(response);
    }

    /**
     * Giriş yapmış öğretmene ait kursları sayfalı olarak listeler.
     * Sadece ROLE_TEACHER rolüne sahip kullanıcılar erişebilir.
     * Varsayılan olarak sayfa boyutu 10, kurs adına göre artan sıralama.
     *
     * @param pageable Sayfalama ve sıralama bilgileri.
     * @return Öğretmene ait kurs yanıt DTO'larının sayfalı listesi ve HTTP 200 OK durumu.
     */
    @GetMapping("/teacher/me")
    @PreAuthorize("hasRole('ROLE_TEACHER')") // Sadece öğretmenler kendi kurslarını listeleyebilir
    public ResponseEntity<PageResponse<CourseResponse>> getCoursesByCurrentTeacher(
            @PageableDefault(size = 10, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        PageResponse<CourseResponse> courses = courseService.getCoursesByCurrentTeacher(pageable);
        return ResponseEntity.ok(courses);
    }

    /**
     * Kursları, isim ve sınıf seviyesi filtrelemesiyle sayfalı olarak arar.
     * Herkes erişebilir (yetkilendirme gerektirmez).
     * Varsayılan olarak sayfa boyutu 10, kurs adına göre artan sıralama.
     *
     * @param name       Kurs adının bir kısmı (isteğe bağlı).
     * @param gradeLevel Kursun sınıf seviyesi (isteğe bağlı).
     * @param pageable   Sayfalama ve sıralama bilgileri.
     * @return Filtrelenmiş kurs yanıt DTO'larının sayfalı listesi ve HTTP 200 OK durumu.
     */
    @GetMapping("/search")
    public ResponseEntity<PageResponse<CourseResponse>> searchCourses(
            @RequestParam(required = false) String name, // İsteğe bağlı sorgu parametresi
            @RequestParam(required = false) Integer gradeLevel, // İsteğe bağlı sorgu parametresi
            @PageableDefault(size = 10, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {

        PageResponse<CourseResponse> courses = courseService.searchCourses(name, gradeLevel, pageable);
        return ResponseEntity.ok(courses);
    }

}