package org.kafka.examsystem.exam_question.controller;

import lombok.RequiredArgsConstructor;
import org.kafka.examsystem.common.dto.PageResponse;
import org.kafka.examsystem.exam_question.dto.ExamQuestionCreateRequest;
import org.kafka.examsystem.exam_question.dto.ExamQuestionResponse;
import org.kafka.examsystem.exam_question.dto.ExamQuestionUpdateRequest;
import org.kafka.examsystem.exam_question.service.ExamQuestionService;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/api/exam-questions")
@RequiredArgsConstructor
public class ExamQuestionController {

    private final ExamQuestionService examQuestionService;


    /**
     * Yeni bir sınav sorusu oluşturur. Sadece ADMIN ve öğretmenler erişebilir.
     * @param request Soru oluşturma isteği DTO'su.
     * @return Oluşturulan sorunun yanıtı ve HTTP 201 Created durumu.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_TEACHER')")
    public ResponseEntity<ExamQuestionResponse> createExamQuestion(@RequestBody ExamQuestionCreateRequest request) {
        ExamQuestionResponse createdQuestion = examQuestionService.createExamQuestion(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(createdQuestion.getId())
                .toUri();
        return ResponseEntity.created(location).body(createdQuestion);
    }

    /**
     * Belirli bir sınav sorusunu günceller. Sadece ADMIN ve öğretmenler erişebilir.
     * @param questionId Güncellenecek sorunun ID'si.
     * @param request Soru güncelleme isteği DTO'su.
     * @return Güncellenen sorunun yanıtı ve HTTP 200 OK durumu.
     */
    @PutMapping("/{questionId}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_TEACHER')")
    public ResponseEntity<ExamQuestionResponse> updateExamQuestion(@PathVariable Long questionId, @RequestBody ExamQuestionUpdateRequest request) {
        ExamQuestionResponse updatedQuestion = examQuestionService.updateExamQuestion(questionId, request);
        return ResponseEntity.ok(updatedQuestion);
    }

    /**
     * Belirli bir sınav sorusunu siler. Sadece ADMIN ve öğretmenler erişebilir.
     * @param questionId Silinecek sorunun ID'si.
     * @return HTTP 204 No Content durumu.
     */
    @DeleteMapping("/{questionId}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_TEACHER')")
    public ResponseEntity<Void> deleteExamQuestion(@PathVariable Long questionId) {
        examQuestionService.deleteExamQuestion(questionId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Belirli bir ID'ye sahip sınav sorusunu getirir. Bu metoda sadece ADMIN, ilgili kursun öğretmeni veya kursa kayıtlı öğrenci erişebilir.
     * @param questionId Sınav sorusu ID'si.
     * @return Soru yanıtı ve HTTP 200 OK durumu.
     */
    @GetMapping("/{questionId}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_TEACHER', 'ROLE_STUDENT')")
    public ResponseEntity<ExamQuestionResponse> getExamQuestionById(@PathVariable Long questionId) {
        ExamQuestionResponse question = examQuestionService.getExamQuestionById(questionId);
        return ResponseEntity.ok(question);
    }

    /**
     * Sınav ID'si ve isteğe bağlı olarak konu ID'sine göre sınav sorularını listeler. Bu metot, sadece ADMIN, ilgili kursun öğretmeni veya kursa kayıtlı öğrenci tarafından kullanılabilir.
     * @param examId Sınav ID'si.
     * @param topicId Konu ID'si (isteğe bağlı).
     * @param pageable Sayfalama bilgileri.
     * @return Sınav sorularının sayfalı listesi ve HTTP 200 OK durumu.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_TEACHER', 'ROLE_STUDENT')")
    public ResponseEntity<PageResponse<ExamQuestionResponse>> getExamQuestionsByExamId(
            @RequestParam Long examId,
            @RequestParam(required = false) Long topicId,
            Pageable pageable) {
        PageResponse<ExamQuestionResponse> questions = examQuestionService.getExamQuestionsByExamId(examId, topicId, pageable);
        return ResponseEntity.ok(questions);
    }
}
