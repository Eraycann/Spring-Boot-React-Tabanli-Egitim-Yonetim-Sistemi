package org.kafka.examsystem.exam_question.service;

import lombok.RequiredArgsConstructor;
import org.kafka.examsystem.common.authorization.CourseAuthorizationService;
import org.kafka.examsystem.common.dto.PageResponse;
import org.kafka.examsystem.common.util.AuthUtil;
import org.kafka.examsystem.exam.model.Exam;
import org.kafka.examsystem.exam.service.ExamService;
import org.kafka.examsystem.exam_question.dto.ExamQuestionCreateRequest;
import org.kafka.examsystem.exam_question.dto.ExamQuestionResponse;
import org.kafka.examsystem.exam_question.dto.ExamQuestionUpdateRequest;
import org.kafka.examsystem.exam_question.exception.domain.ExamQuestionDomainErrorCode;
import org.kafka.examsystem.exam_question.exception.domain.ExamQuestionDomainException;
import org.kafka.examsystem.exam_question.mapper.ExamQuestionMapper;
import org.kafka.examsystem.exam_question.model.ExamQuestion;
import org.kafka.examsystem.exam_question.repository.ExamQuestionRepository;
import org.kafka.examsystem.topic.model.Topic;
import org.kafka.examsystem.topic.service.TopicService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

/**
 * Sınav sorularıyla ilgili iş mantığını yöneten servis sınıfı.
 * Sorular için CRUD işlemleri ve yetkilendirme kontrolleri içerir.
 */
@Service
@RequiredArgsConstructor
public class ExamQuestionService {

    private final ExamQuestionRepository examQuestionRepository;
    private final ExamQuestionMapper examQuestionMapper;
    private final ExamService examService;
    private final TopicService topicService;
    private final CourseAuthorizationService courseAuthorizationService;

    /**
     * Yeni bir sınav sorusu oluşturur. Sadece **kursun öğretmeni** veya **ADMIN** yetkisine sahip kullanıcılar
     * soru oluşturabilir.
     *
     * @param request Soru oluşturma isteği DTO'su.
     * @return Oluşturulan sorunun yanıt DTO'su.
     */
    @Transactional
    public ExamQuestionResponse createExamQuestion(ExamQuestionCreateRequest request) {
        Exam exam = examService.getExamById(request.getExamId());
        if (exam == null) {
            throw new ExamQuestionDomainException(ExamQuestionDomainErrorCode.QUESTION_NOT_FOUND);
        }
        Topic topic = topicService.getTopicEntityById(request.getTopicId());

        // Yetkilendirme kontrolü: Kursun öğretmeni veya ADMIN olmalı.
        if (!courseAuthorizationService.canModifyCourse(exam.getCourse(), AuthUtil.getCurrentUserId())) {
            throw new ExamQuestionDomainException(ExamQuestionDomainErrorCode.UNAUTHORIZED_QUESTION_ACCESS);
        }

        ExamQuestion examQuestion = examQuestionMapper.toExamQuestion(request);
        examQuestion.setExam(exam);
        examQuestion.setTopic(topic);

        ExamQuestion savedQuestion = examQuestionRepository.save(examQuestion);
        return examQuestionMapper.toExamQuestionResponse(savedQuestion);
    }

    /**
     * Mevcut bir sınav sorusunu günceller. Sadece **ilgili kursun öğretmeni** veya **ADMIN** yetkisine sahip kullanıcılar
     * soruyu güncelleyebilir.
     *
     * @param questionId Güncellenecek sorunun ID'si.
     * @param request Soru güncelleme isteği DTO'su.
     * @return Güncellenen sorunun yanıt DTO'su.
     */
    @Transactional
    public ExamQuestionResponse updateExamQuestion(Long questionId, ExamQuestionUpdateRequest request) {
        ExamQuestion examQuestion = examQuestionRepository.findByIdWithExamCourseAndTopic(questionId)
                .orElseThrow(() -> new ExamQuestionDomainException(ExamQuestionDomainErrorCode.QUESTION_NOT_FOUND));

        // Yetkilendirme kontrolü: Kursun öğretmeni veya ADMIN olmalı.
        if (!courseAuthorizationService.canModifyCourse(examQuestion.getExam().getCourse(), AuthUtil.getCurrentUserId())) {
            throw new ExamQuestionDomainException(ExamQuestionDomainErrorCode.UNAUTHORIZED_QUESTION_ACCESS);
        }

        Topic topic = topicService.getTopicEntityById(request.getTopicId());
        examQuestion.setTopic(topic);
        examQuestion.setQuestionText(request.getQuestionText());
        examQuestion.setCorrectAnswer(request.getCorrectAnswer());
        examQuestion.setScore(request.getScore());
        examQuestionMapper.updateExamQuestionFromDto(request, examQuestion);

        ExamQuestion updatedQuestion = examQuestionRepository.save(examQuestion);
        return examQuestionMapper.toExamQuestionResponse(updatedQuestion);
    }

    /**
     * Bir sınav sorusunu siler. Sadece **ilgili kursun öğretmeni** veya **ADMIN** yetkisine sahip kullanıcılar
     * soruyu silebilir.
     *
     * @param questionId Silinecek sorunun ID'si.
     */
    @Transactional
    public void deleteExamQuestion(Long questionId) {
        ExamQuestion examQuestion = examQuestionRepository.findByIdWithExamCourseAndTopic(questionId)
                .orElseThrow(() -> new ExamQuestionDomainException(ExamQuestionDomainErrorCode.QUESTION_NOT_FOUND));

        // Yetkilendirme kontrolü: Kursun öğretmeni veya ADMIN olmalı.
        if (!courseAuthorizationService.canModifyCourse(examQuestion.getExam().getCourse(), AuthUtil.getCurrentUserId())) {
            throw new ExamQuestionDomainException(ExamQuestionDomainErrorCode.UNAUTHORIZED_QUESTION_ACCESS);
        }
        examQuestionRepository.delete(examQuestion);
    }

    /**
     * Belirli bir ID'ye sahip sınav sorusunu getirir. Bu metoda sadece **ADMIN**, **ilgili kursun öğretmeni** veya **kursa kayıtlı öğrenci** erişebilir.
     *
     * @param questionId Sınav sorusu ID'si.
     * @return Soru yanıt DTO'su.
     */
    @Transactional(readOnly = true)
    public ExamQuestionResponse getExamQuestionById(Long questionId) {
        ExamQuestion examQuestion = examQuestionRepository.findByIdWithExamCourseAndTopic(questionId)
                .orElseThrow(() -> new ExamQuestionDomainException(ExamQuestionDomainErrorCode.QUESTION_NOT_FOUND));

        // Yetkilendirme kontrolü.
        if (!courseAuthorizationService.canViewCourseContent(examQuestion.getExam().getCourse(), AuthUtil.getCurrentUserId())) {
            throw new ExamQuestionDomainException(ExamQuestionDomainErrorCode.UNAUTHORIZED_QUESTION_ACCESS);
        }

        return examQuestionMapper.toExamQuestionResponse(examQuestion);
    }

    /**
     * Belirli bir sınava ve isteğe bağlı olarak konuya göre sınav sorularını listeler. Bu metot, sadece **ADMIN**, **ilgili kursun öğretmeni** veya **kursa kayıtlı öğrenci** tarafından kullanılabilir.
     *
     * @param examId Sınav ID'si.
     * @param topicId Konu ID'si (null olabilir).
     * @param pageable Sayfalama bilgileri.
     * @return Sınav sorularının sayfalı listesi.
     */
    @Transactional(readOnly = true)
    public PageResponse<ExamQuestionResponse> getExamQuestionsByExamId(Long examId, Long topicId, Pageable pageable) {
        // İlk olarak sınavı ve bağlı olduğu dersi getiriyoruz, yetkilendirme için.
        Exam exam = examService.getExamByIdWithCourse(examId);

        // Yetkilendirme kontrolü.
        if (!courseAuthorizationService.canViewCourseContent(exam.getCourse(), AuthUtil.getCurrentUserId())) {
            throw new ExamQuestionDomainException(ExamQuestionDomainErrorCode.UNAUTHORIZED_QUESTION_ACCESS);
        }

        Page<ExamQuestion> questionsPage = examQuestionRepository.findByExamIdAndTopicId(examId, topicId, pageable);
        List<ExamQuestionResponse> responses = questionsPage.map(examQuestionMapper::toExamQuestionResponse).getContent();
        return PageResponse.fromPage(questionsPage, responses);
    }

    /**
     * Belirli bir ID'ye sahip sınav sorusunu, ilişkili entity'leri ile birlikte getirir.
     * Diğer servisler tarafından kullanılmak üzere tasarlanmıştır.
     * @param questionId Sınav sorusu ID'si.
     * @return Sınav sorusu nesnesi.
     */
    @Transactional(readOnly = true)
    public ExamQuestion getExamQuestionEntityById(Long questionId) {
        return examQuestionRepository.findByIdAndFetchExamAndTopic(questionId)
                .orElseThrow(() -> new ExamQuestionDomainException(ExamQuestionDomainErrorCode.QUESTION_NOT_FOUND));
    }
}
