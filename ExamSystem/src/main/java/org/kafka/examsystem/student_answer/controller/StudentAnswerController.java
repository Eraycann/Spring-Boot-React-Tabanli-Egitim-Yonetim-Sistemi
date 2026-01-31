package org.kafka.examsystem.student_answer.controller;

import lombok.RequiredArgsConstructor;
import org.kafka.examsystem.common.dto.PageResponse;
import org.kafka.examsystem.student_answer.dto.StudentAnswerCreateRequest;
import org.kafka.examsystem.student_answer.dto.StudentAnswerResponse;
import org.kafka.examsystem.student_answer.service.StudentAnswerService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student-answers")
@RequiredArgsConstructor
public class StudentAnswerController {

    private final StudentAnswerService studentAnswerService;

    /**
     * Yeni bir öğrenci cevabı oluşturmak için kullanılan RESTful endpoint'i.
     *
     * @param request Öğrenci cevabı detaylarını içeren DTO.
     * @return Oluşturulan cevap ve HttpStatus.CREATED içeren ResponseEntity.
     */
    @PostMapping
    @PreAuthorize("hasRole('ROLE_STUDENT')")
    public ResponseEntity<StudentAnswerResponse> createStudentAnswer(@RequestBody StudentAnswerCreateRequest request) {
        StudentAnswerResponse response = studentAnswerService.createStudentAnswer(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Bir öğrencinin belirli bir gönderime ait cevaplarını almak için kullanılan RESTful endpoint'i.
     *
     * @param submissionId Gönderim ID'si.
     * @param pageable Sayfalama ve sıralama bilgisi.
     * @return Sayfalanmış cevap listesini içeren ResponseEntity.
     */
    @GetMapping("/submission/{submissionId}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_TEACHER')")
    public ResponseEntity<PageResponse<StudentAnswerResponse>> getAnswersBySubmissionId(
            @PathVariable Long submissionId,
            @PageableDefault Pageable pageable) {
        PageResponse<StudentAnswerResponse> response = studentAnswerService.getAnswersBySubmissionId(submissionId, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Bir sınava ait tüm öğrencilerin cevaplarını almak için kullanılan RESTful endpoint'i.
     * Sadece ADMIN rolüne sahip kullanıcılar erişebilir.
     *
     * @param examId Sınav ID'si.
     * @param pageable Sayfalama ve sıralama bilgisi.
     * @return Sayfalanmış tüm cevapları içeren ResponseEntity.
     */
    @GetMapping("/exam/{examId}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_TEACHER')")
    public ResponseEntity<PageResponse<StudentAnswerResponse>> getAnswersByExamId(
            @PathVariable Long examId,
            @PageableDefault Pageable pageable) {
        PageResponse<StudentAnswerResponse> response = studentAnswerService.getAnswersByExamId(examId, pageable);
        return ResponseEntity.ok(response);
    }
}
