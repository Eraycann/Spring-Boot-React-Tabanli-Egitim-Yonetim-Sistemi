package org.kafka.examsystem.student_answer.service;

import lombok.RequiredArgsConstructor;
import org.kafka.examsystem.common.dto.PageResponse;
import org.kafka.examsystem.common.util.AuthUtil;
import org.kafka.examsystem.course_student.service.CourseEnrollmentService;
import org.kafka.examsystem.exam_question.model.ExamQuestion;
import org.kafka.examsystem.exam_question.service.ExamQuestionService;
import org.kafka.examsystem.exam_submission.model.ExamSubmission;
import org.kafka.examsystem.exam_submission.service.ExamSubmissionService;
import org.kafka.examsystem.student_answer.dto.StudentAnswerCreateRequest;
import org.kafka.examsystem.student_answer.dto.StudentAnswerResponse;
import org.kafka.examsystem.student_answer.exception.domain.StudentAnswerDomainErrorCode;
import org.kafka.examsystem.student_answer.exception.domain.StudentAnswerDomainException;
import org.kafka.examsystem.student_answer.mapper.StudentAnswerMapper;
import org.kafka.examsystem.student_answer.model.StudentAnswer;
import org.kafka.examsystem.student_answer.repository.StudentAnswerRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Öğrenci cevaplarıyla ilgili iş mantığını yöneten servis sınıfı.
 * Cevap oluşturma ve yetkilendirme kontrollü filtreli listeleme işlemlerini içerir.
 */
@Service
@RequiredArgsConstructor
public class StudentAnswerService {

    private final StudentAnswerRepository studentAnswerRepository;
    private final StudentAnswerMapper studentAnswerMapper;
    private final ExamSubmissionService examSubmissionService;
    private final ExamQuestionService examQuestionService;
    private final CourseEnrollmentService courseEnrollmentService;

    /**
     * Yeni bir öğrenci cevabı oluşturur ve puanını hesaplar.
     * Sadece sınava giren öğrenci ve ilgili derse kayıtlıysa bu işlemi yapabilir.
     *
     * @param request Cevap oluşturma isteği DTO'su.
     * @return Oluşturulan cevabın yanıt DTO'su.
     */
    @Transactional
    public StudentAnswerResponse createStudentAnswer(StudentAnswerCreateRequest request) {
        ExamSubmission submission = examSubmissionService.getExamSubmissionById(request.getSubmissionId());
        ExamQuestion question = examQuestionService.getExamQuestionEntityById(request.getQuestionId());
        Long currentUserId = AuthUtil.getCurrentUserId();

        // Yetkilendirme kontrolü: Mevcut kullanıcı, sınavı gönderen öğrenci olmalı.
        if (!currentUserId.equals(submission.getStudent().getUser().getId())) {
            throw new StudentAnswerDomainException(StudentAnswerDomainErrorCode.UNAUTHORIZED_ANSWER_SUBMISSION);
        }

        // Ek yetkilendirme kontrolü: Öğrenci, sınavın ait olduğu derse kayıtlı olmalı.
        if (!courseEnrollmentService.isStudentEnrolledInCourse(submission.getExam().getCourse().getId(), currentUserId)) {
            throw new StudentAnswerDomainException(StudentAnswerDomainErrorCode.UNAUTHORIZED_ANSWER_SUBMISSION);
        }

        // Cevabın doğruluğunu kontrol et ve sorunun kendi puanını kullanarak puanı hesapla
        boolean isCorrect = request.getGivenAnswer().equals(question.getCorrectAnswer());
        int score = isCorrect ? question.getScore() : 0;

        StudentAnswer studentAnswer = studentAnswerMapper.toStudentAnswer(request);
        studentAnswer.setSubmission(submission);
        studentAnswer.setQuestion(question);
        studentAnswer.setCorrect(isCorrect);
        studentAnswer.setScore(score);

        StudentAnswer savedAnswer = studentAnswerRepository.save(studentAnswer);

        // ExamSubmission'ın toplam puanını güncelle
        examSubmissionService.updateTotalScore(submission, score);

        return studentAnswerMapper.toStudentAnswerResponse(savedAnswer);
    }

    /**
     * Öğrencinin bir sınav gönderimine ait cevaplarını sayfalı olarak getirir.
     * Sadece öğrencinin kendisi veya ADMIN yetkisine sahip kullanıcılar erişebilir.
     *
     * @param submissionId Sınav gönderim ID'si.
     * @param pageable Sayfalama bilgileri.
     * @return Cevapların sayfalı listesi.
     */
    @Transactional(readOnly = true)
    public PageResponse<StudentAnswerResponse> getAnswersBySubmissionId(Long submissionId, Pageable pageable) {
        ExamSubmission submission = examSubmissionService.getExamSubmissionById(submissionId);
        Long currentUserId = AuthUtil.getCurrentUserId();

        // Yetkilendirme kontrolü
        if (!currentUserId.equals(submission.getStudent().getUser().getId()) && 
            !AuthUtil.hasRole("ROLE_ADMIN") && !AuthUtil.hasRole("ROLE_TEACHER")) {
            throw new StudentAnswerDomainException(StudentAnswerDomainErrorCode.UNAUTHORIZED_ANSWER_ACCESS);
        }

        Page<StudentAnswer> answersPage = studentAnswerRepository.findBySubmissionId(submissionId, pageable);
        List<StudentAnswerResponse> responses = studentAnswerMapper.toStudentAnswerResponseList(answersPage.getContent());
        return PageResponse.fromPage(answersPage, responses);
    }

    /**
     * Belirli bir sınava ait tüm öğrencilerin cevaplarını sayfalı olarak getirir.
     * Sadece ADMIN veya TEACHER yetkisine sahip kullanıcılar erişebilir.
     *
     * @param examId Sınav ID'si.
     * @param pageable Sayfalama bilgileri.
     * @return Cevapların sayfalı listesi.
     */
    @Transactional(readOnly = true)
    public PageResponse<StudentAnswerResponse> getAnswersByExamId(Long examId, Pageable pageable) {
        if (!AuthUtil.hasRole("ROLE_ADMIN") && !AuthUtil.hasRole("ROLE_TEACHER")) {
            throw new StudentAnswerDomainException(StudentAnswerDomainErrorCode.UNAUTHORIZED_ANSWER_ACCESS);
        }

        Page<StudentAnswer> answersPage = studentAnswerRepository.findByExamId(examId, pageable);
        List<StudentAnswerResponse> responses = studentAnswerMapper.toStudentAnswerResponseList(answersPage.getContent());
        return PageResponse.fromPage(answersPage, responses);
    }
}
