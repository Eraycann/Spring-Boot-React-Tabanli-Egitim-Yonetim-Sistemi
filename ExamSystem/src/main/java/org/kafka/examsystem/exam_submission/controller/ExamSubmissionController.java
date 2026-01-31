package org.kafka.examsystem.exam_submission.controller;

import lombok.RequiredArgsConstructor;
import org.kafka.examsystem.common.dto.PageResponse;
import org.kafka.examsystem.exam_submission.dto.ExamSubmissionCreateRequest;
import org.kafka.examsystem.exam_submission.dto.ExamSubmissionResponse;
import org.kafka.examsystem.exam_submission.service.ExamSubmissionService;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

/**
 * Öğrenci sınav girişleri için REST API uç noktalarını yöneten controller sınıfı.
 */
@RestController
@RequestMapping("/api/exam-submissions")
@RequiredArgsConstructor
public class ExamSubmissionController {

    private final ExamSubmissionService examSubmissionService;

    /**
     * Öğrencinin yeni bir sınava giriş yapmasını sağlar.
     * @param request Sınav girişi oluşturma isteği DTO'su.
     * @return Oluşturulan sınav girişinin yanıtı ve HTTP 201 Created durumu.
     */
    @PostMapping
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<ExamSubmissionResponse> createSubmission(@RequestBody ExamSubmissionCreateRequest request) {
        ExamSubmissionResponse createdSubmission = examSubmissionService.createSubmission(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(createdSubmission.getId())
                .toUri();
        return ResponseEntity.created(location).body(createdSubmission);
    }

    /**
     * Belirli bir sınav girişini ID'sine göre getirir.
     * Sadece ilgili kullanıcıların erişimine açıktır.
     * @param submissionId Getirilecek sınav girişinin ID'si.
     * @return Sınav girişi yanıtı ve HTTP 200 OK durumu.
     */
    @GetMapping("/{submissionId}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_TEACHER', 'ROLE_STUDENT', 'ROLE_PARENT')")
    public ResponseEntity<ExamSubmissionResponse> getSubmissionById(@PathVariable Long submissionId) {
        ExamSubmissionResponse submission = examSubmissionService.getSubmissionById(submissionId);
        return ResponseEntity.ok(submission);
    }

    /**
     * Sınav girişlerini çeşitli parametrelere göre filtreleyerek listeler.
     * Yetkilendirme, servis katmanında rol bazlı olarak uygulanır.
     *
     * @param examId Filtrelemek için sınav ID'si (isteğe bağlı).
     * @param courseId Filtrelemek için ders ID'si (isteğe bağlı).
     * @param studentId Filtrelemek için öğrenci ID'si (isteğe bağlı).
     * @param pageable Sayfalama bilgileri.
     * @return Sınav girişlerinin sayfalı listesi.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_TEACHER', 'ROLE_STUDENT', 'ROLE_PARENT')")
    public ResponseEntity<PageResponse<ExamSubmissionResponse>> searchSubmissions(
            @RequestParam(required = false) Long examId,
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Long studentId,
            Pageable pageable) {
        PageResponse<ExamSubmissionResponse> submissions = examSubmissionService.searchSubmissions(examId, courseId, studentId, pageable);
        return ResponseEntity.ok(submissions);
    }

    /**
     * Öğrencinin sınavını tamamlamasını sağlar.
     * Sadece ROLE_STUDENT yetkisine sahip kullanıcılar erişebilir.
     * 
     * @param submissionId Tamamlanacak sınav girişinin ID'si.
     * @return Tamamlanan sınav girişinin yanıtı ve HTTP 200 OK durumu.
     */
    @PutMapping("/{submissionId}/submit")
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<ExamSubmissionResponse> submitExam(@PathVariable Long submissionId) {
        ExamSubmissionResponse submittedExam = examSubmissionService.submitExam(submissionId);
        return ResponseEntity.ok(submittedExam);
    }
}
