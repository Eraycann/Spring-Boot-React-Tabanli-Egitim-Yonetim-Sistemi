package org.kafka.examsystem.exam.controller;

import lombok.RequiredArgsConstructor;
import org.kafka.examsystem.common.dto.PageResponse;
import org.kafka.examsystem.exam.dto.ExamCreateRequest;
import org.kafka.examsystem.exam.dto.ExamResponse;
import org.kafka.examsystem.exam.dto.ExamUpdateRequest;
import org.kafka.examsystem.exam.service.ExamService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

/**
 * Sınav kaynakları için REST API uç noktalarını yöneten controller sınıfı.
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ExamController {

    private final ExamService examService;

    /**
     * Yeni bir sınav oluşturur.
     * Sadece ROLE_TEACHER veya ROLE_ADMIN rolüne sahip kullanıcılar erişebilir.
     * @param request Sınav oluşturma isteği DTO'su.
     * @return Oluşturulan sınavın yanıtı ve HTTP 201 Created durumu.
     */
    @PostMapping("/exams")
    @PreAuthorize("hasAnyRole('ROLE_TEACHER', 'ROLE_ADMIN')")
    public ResponseEntity<ExamResponse> createExam(@RequestBody ExamCreateRequest request) {
        ExamResponse createdExam = examService.createExam(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(createdExam.getId())
                .toUri();
        return ResponseEntity.created(location).body(createdExam);
    }

    /**
     * Mevcut bir sınavı günceller.
     * Sadece kursun öğretmeni veya ADMIN rolüne sahip kullanıcılar erişebilir.
     * @param examId Güncellenecek sınavın ID'si.
     * @param request Sınav güncelleme isteği DTO'su.
     * @return Güncellenen sınavın yanıtı ve HTTP 200 OK durumu.
     */
    @PutMapping("/exams/{examId}")
    @PreAuthorize("hasAnyRole('ROLE_TEACHER', 'ROLE_ADMIN')")
    public ResponseEntity<ExamResponse> updateExam(@PathVariable Long examId, @RequestBody ExamUpdateRequest request) {
        ExamResponse updatedExam = examService.updateExam(examId, request);
        return ResponseEntity.ok(updatedExam);
    }

    /**
     * Bir sınavı siler.
     * Sadece kursun öğretmeni veya ADMIN rolüne sahip kullanıcılar erişebilir.
     * @param examId Silinecek sınavın ID'si.
     * @return Boş yanıt ve HTTP 204 No Content durumu.
     */
    @DeleteMapping("/exams/{examId}")
    @PreAuthorize("hasAnyRole('ROLE_TEACHER', 'ROLE_ADMIN')")
    public ResponseEntity<Void> deleteExam(@PathVariable Long examId) {
        examService.deleteExam(examId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Bir sınavı başlatır.
     * Sadece kursun öğretmeni veya ADMIN rolüne sahip kullanıcılar erişebilir.
     * @param examId Başlatılacak sınavın ID'si.
     * @return Başlatılan sınavın yanıtı ve HTTP 200 OK durumu.
     */
    @PostMapping("/exams/{examId}/start")
    @PreAuthorize("hasAnyRole('ROLE_TEACHER', 'ROLE_ADMIN')")
    public ResponseEntity<ExamResponse> startExam(@PathVariable Long examId) {
        ExamResponse startedExam = examService.startExam(examId);
        return ResponseEntity.ok(startedExam);
    }

    /**
     * Belirli bir sınavı ID'sine göre getirir.
     * Herkes erişebilir.
     * @param examId Getirilecek sınavın ID'si.
     * @return Sınav yanıtı ve HTTP 200 OK durumu.
     */
    @GetMapping("/exams/{examId}")
    public ResponseEntity<ExamResponse> getExamById(@PathVariable Long examId) {
        ExamResponse exam = examService.getExamResponseById(examId);
        return ResponseEntity.ok(exam);
    }

    /**
     * Tüm sınavları listeler ve ad, aktiflik durumu, ders ID'ye göre filtreleme yapabilir.
     * Herkes erişebilir.
     * @param name Sınav adının bir kısmı (opsiyonel).
     * @param isActive Aktiflik durumu (opsiyonel).
     * @param courseId Ders ID'si (opsiyonel).
     * @param pageable Sayfalama bilgileri.
     * @return Filtrelenmiş ve sayfalı sınav listesi ve HTTP 200 OK durumu.
     */
    @GetMapping("/exams")
    public ResponseEntity<PageResponse<ExamResponse>> searchExams(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) Long courseId,
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<ExamResponse> exams = examService.searchExams(name, isActive, courseId, pageable);
        return ResponseEntity.ok(exams);
    }

    /**
     * Belirli bir derse ait tüm sınavları listeler.
     * Herkes erişebilir.
     * @param courseId Ders ID'si.
     * @param pageable Sayfalama bilgileri.
     * @return İlgili derse ait sayfalı sınav listesi ve HTTP 200 OK durumu.
     */
    @GetMapping("/courses/{courseId}/exams")
    public ResponseEntity<PageResponse<ExamResponse>> getExamsForCourse(
            @PathVariable Long courseId,
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<ExamResponse> exams = examService.getExamsByCourseId(courseId, pageable);
        return ResponseEntity.ok(exams);
    }
}
