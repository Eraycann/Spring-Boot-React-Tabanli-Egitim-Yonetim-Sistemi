package org.kafka.examsystem.exam_submission.service;

import lombok.RequiredArgsConstructor;
import org.kafka.examsystem.common.dto.PageResponse;
import org.kafka.examsystem.common.util.AuthUtil;
import org.kafka.examsystem.course_student.service.CourseEnrollmentService;
import org.kafka.examsystem.exam.exception.domain.ExamDomainException;
import org.kafka.examsystem.exam.model.Exam;
import org.kafka.examsystem.exam.service.ExamService;
import org.kafka.examsystem.exam_submission.dto.ExamSubmissionCreateRequest;
import org.kafka.examsystem.exam_submission.dto.ExamSubmissionResponse;
import org.kafka.examsystem.exam_submission.exception.domain.ExamSubmissionDomainErrorCode;
import org.kafka.examsystem.exam_submission.exception.domain.ExamSubmissionDomainException;
import org.kafka.examsystem.exam_submission.mapper.ExamSubmissionMapper;
import org.kafka.examsystem.exam_submission.model.ExamSubmission;
import org.kafka.examsystem.exam_submission.repository.ExamSubmissionRepository;
import org.kafka.examsystem.parent.model.Parent;
import org.kafka.examsystem.parent.service.ParentService;
import org.kafka.examsystem.student.model.Student;
import org.kafka.examsystem.student.service.StudentService;
import org.kafka.examsystem.teacher.service.TeacherService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Öğrencilerin sınav girişlerini yöneten servis sınıfı.
 * Yeni sınav girişi oluşturma ve mevcut sınav girişlerini getirme işlemlerini içerir.
 */
@Service
@RequiredArgsConstructor
public class ExamSubmissionService {

    private final ExamSubmissionRepository examSubmissionRepository;
    private final ExamSubmissionMapper examSubmissionMapper;
    private final ExamService examService;
    private final CourseEnrollmentService courseEnrollmentService;
    private final TeacherService teacherService;
    private final ParentService parentService;
    private final StudentService studentService;

    /**
     * Öğrencinin yeni bir sınava girişini oluşturur.
     *
     * @param request Sınav girişi oluşturma isteği DTO'su.
     * @return Oluşturulan sınav girişinin yanıt DTO'su.
     * @throws ExamSubmissionDomainException Eğer öğrenci zaten sınava girmişse veya yetkilendirme hatası olursa.
     * @throws ExamDomainException Eğer sınav aktif değilse veya süresi dolmuşsa.
     */
    @Transactional
    public ExamSubmissionResponse createSubmission(ExamSubmissionCreateRequest request) {
        Long currentUserId = AuthUtil.getCurrentUserId();

        // 1. Sınavın varlığını ve durumunu kontrol et
        Exam exam = examService.getExamByIdWithCourse(request.getExamId());

        // 2. Sınavın aktifliğini ve süresini kontrol et
        examService.canStudentAccessExam(exam);

        // 3. Öğrencinin ilgili derse kayıtlı olup olmadığını kontrol et
        if (!courseEnrollmentService.isStudentEnrolledInCourse(exam.getCourse().getId(), currentUserId)) {
            throw new ExamSubmissionDomainException(ExamSubmissionDomainErrorCode.NOT_ENROLLED_IN_COURSE);
        }

        // 4. Öğrencinin bu sınava daha önce aktif bir girişinin olup olmadığını kontrol et
        // Student'ın ID'sini almak için StudentService kullanıldı.
        Long currentStudentId = studentService.getStudentByUserId(currentUserId).getId();
        Optional<ExamSubmission> existingSubmission = examSubmissionRepository.findByStudentIdAndExamIdAndSubmittedAtIsNull(currentStudentId, request.getExamId());
        if (existingSubmission.isPresent()) {
            throw new ExamSubmissionDomainException(ExamSubmissionDomainErrorCode.ACTIVE_SUBMISSION_ALREADY_EXISTS);
        }

        // 5. Yeni sınav girişini oluştur
        ExamSubmission submission = new ExamSubmission();
        submission.setExam(exam);
        // Düzeltme: User yerine Student nesnesi atandı.
        submission.setStudent(studentService.getStudentByUserId(currentUserId));
        // submittedAt ve totalScore başlangıçta null olarak kalır.

        ExamSubmission savedSubmission = examSubmissionRepository.save(submission);
        return examSubmissionMapper.toExamSubmissionResponse(savedSubmission);
    }

    /**
     * Belirli bir sınav girişini ID'sine göre getirir.
     *
     * @param submissionId Getirilecek sınav girişinin ID'si.
     * @return Sınav girişi yanıt DTO'su.
     * @throws ExamSubmissionDomainException Sınav girişi bulunamazsa veya yetkilendirme hatası olursa.
     */
    @Transactional(readOnly = true)
    public ExamSubmissionResponse getSubmissionById(Long submissionId) {
        Long currentUserId = AuthUtil.getCurrentUserId();

        ExamSubmission submission = examSubmissionRepository.findByIdWithDetails(submissionId)
                .orElseThrow(() -> new ExamSubmissionDomainException(ExamSubmissionDomainErrorCode.SUBMISSION_NOT_FOUND));

        boolean isAuthorized = false;
        if (AuthUtil.hasRole("ROLE_ADMIN")) {
            isAuthorized = true;
        } else if (AuthUtil.hasRole("ROLE_STUDENT") && submission.getStudent().getUser().getId().equals(currentUserId)) {
            isAuthorized = true;
        } else if (AuthUtil.hasRole("ROLE_TEACHER") && submission.getExam().getCourse().getTeacher().getUser().getId().equals(currentUserId)) {
            isAuthorized = true;
        } else if (AuthUtil.hasRole("ROLE_PARENT")) {
            Parent parent = parentService.getParentByUserId(currentUserId);
            List<Student> students = studentService.getStudentsByParent(parent);
            if (students.stream().anyMatch(student -> student.getId().equals(submission.getStudent().getId()))) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            throw new ExamSubmissionDomainException(ExamSubmissionDomainErrorCode.UNAUTHORIZED_SUBMISSION_ACCESS);
        }

        return examSubmissionMapper.toExamSubmissionResponse(submission);
    }

    /**
     * Sınav girişlerini kullanıcının rolüne göre filtreleyerek listeler.
     *
     * @param examId Filtrelemek için sınav ID'si (isteğe bağlı).
     * @param courseId Filtrelemek için ders ID'si (isteğe bağlı).
     * @param studentId Filtrelemek için öğrenci ID'si (isteğe bağlı).
     * @param pageable Sayfalama bilgileri.
     * @return Sınav girişlerinin sayfalı listesi.
     * @throws ExamSubmissionDomainException Yetkilendirme hatası oluşursa.
     */
    @Transactional(readOnly = true)
    public PageResponse<ExamSubmissionResponse> searchSubmissions(Long examId, Long courseId, Long studentId, Pageable pageable) {
        Long currentUserId = AuthUtil.getCurrentUserId();
        Long teacherId = null;
        List<Long> studentIds = null;
        Long studentIdFilter = studentId;

        if (AuthUtil.hasRole("ROLE_ADMIN")) {
            // Admin için ek filtreleme gerekmez.
        } else if (AuthUtil.hasRole("ROLE_TEACHER")) {
            try {
                teacherId = teacherService.getTeacherByUserId(currentUserId).getId();
            } catch (Exception e) {
                // Öğretmen bulunamadıysa boş liste döndür
                return PageResponse.fromPage(Page.empty(pageable), List.of());
            }
        } else if (AuthUtil.hasRole("ROLE_STUDENT")) {
            try {
                studentIdFilter = studentService.getStudentByUserId(currentUserId).getId();
            } catch (Exception e) {
                // Öğrenci bulunamadıysa boş liste döndür
                return PageResponse.fromPage(Page.empty(pageable), List.of());
            }
        } else if (AuthUtil.hasRole("ROLE_PARENT")) {
            Parent parent = parentService.getParentByUserId(currentUserId);
            studentIds = studentService.getStudentsByParent(parent).stream()
                    .map(Student::getId)
                    .collect(Collectors.toList());
            if (studentIds.isEmpty()) {
                return PageResponse.fromPage(Page.empty(pageable), List.of());
            }
        } else {
            throw new ExamSubmissionDomainException(ExamSubmissionDomainErrorCode.UNAUTHORIZED_SUBMISSION_ACCESS);
        }

        Page<ExamSubmission> submissionsPage = examSubmissionRepository.searchAllSubmissions(
                examId,
                courseId,
                studentIdFilter,
                teacherId,
                studentIds,
                pageable
        );

        // Düzeltme: Page'in kendi `map` metodu kullanılarak DTO dönüşümü yapıldı.
        Page<ExamSubmissionResponse> responsePage = submissionsPage.map(examSubmissionMapper::toExamSubmissionResponse);
        return PageResponse.fromPage(submissionsPage, responsePage.getContent());
    }

    /**
     * Belirli bir ID'ye sahip sınav gönderimini getirir.
     * @param submissionId Sınav gönderim ID'si.
     * @return Sınav gönderimi entity'si.
     */
    @Transactional(readOnly = true)
    public ExamSubmission getExamSubmissionById(Long submissionId) {
        return examSubmissionRepository.findById(submissionId)
                .orElseThrow(() -> new ExamSubmissionDomainException(ExamSubmissionDomainErrorCode.SUBMISSION_NOT_FOUND));
    }

    /**
     * Belirli bir sınav gönderiminin toplam puanını günceller.
     * @param submission Güncellenecek sınav gönderimi.
     * @param score Eklenecek puan miktarı.
     */
    @Transactional
    public void updateTotalScore(ExamSubmission submission, int score) {
        submission.setTotalScore(submission.getTotalScore() + score);
        examSubmissionRepository.save(submission);
    }

    /**
     * Öğrencinin sınavını tamamlamasını sağlar.
     * Sadece sınavı başlatan öğrenci sınavı tamamlayabilir.
     * 
     * @param submissionId Tamamlanacak sınav girişinin ID'si.
     * @return Tamamlanan sınav girişinin yanıt DTO'su.
     * @throws ExamSubmissionDomainException Sınav girişi bulunamazsa veya yetkilendirme hatası olursa.
     */
    @Transactional
    public ExamSubmissionResponse submitExam(Long submissionId) {
        Long currentUserId = AuthUtil.getCurrentUserId();
        
        // Sınav girişini getir
        ExamSubmission submission = examSubmissionRepository.findByIdWithDetails(submissionId)
                .orElseThrow(() -> new ExamSubmissionDomainException(ExamSubmissionDomainErrorCode.SUBMISSION_NOT_FOUND));
        
        // Sadece sınavı başlatan öğrenci sınavı tamamlayabilir
        if (!submission.getStudent().getUser().getId().equals(currentUserId)) {
            throw new ExamSubmissionDomainException(ExamSubmissionDomainErrorCode.UNAUTHORIZED_SUBMISSION_ACCESS);
        }
        
        // Sınav zaten tamamlanmışsa hata ver
        if (submission.getSubmittedAt() != null) {
            throw new ExamSubmissionDomainException(ExamSubmissionDomainErrorCode.SUBMISSION_ALREADY_COMPLETED);
        }
        
        // Sınavı tamamla - submittedAt alanını güncelle
        submission.setSubmittedAt(java.time.LocalDateTime.now());
        ExamSubmission savedSubmission = examSubmissionRepository.save(submission);
        
        return examSubmissionMapper.toExamSubmissionResponse(savedSubmission);
    }
}
