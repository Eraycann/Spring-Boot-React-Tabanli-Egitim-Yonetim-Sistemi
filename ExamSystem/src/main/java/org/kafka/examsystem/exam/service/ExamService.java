package org.kafka.examsystem.exam.service;

import lombok.RequiredArgsConstructor;
import org.kafka.examsystem.common.authorization.CourseAuthorizationService;
import org.kafka.examsystem.common.dto.PageResponse;
import org.kafka.examsystem.common.util.AuthUtil;
import org.kafka.examsystem.course.model.Course;
import org.kafka.examsystem.course.service.CourseService;
import org.kafka.examsystem.exam.dto.ExamCreateRequest;
import org.kafka.examsystem.exam.dto.ExamResponse;
import org.kafka.examsystem.exam.dto.ExamUpdateRequest;
import org.kafka.examsystem.exam.exception.domain.ExamDomainErrorCode;
import org.kafka.examsystem.exam.exception.domain.ExamDomainException;
import org.kafka.examsystem.exam.mapper.ExamMapper;
import org.kafka.examsystem.exam.model.Exam;
import org.kafka.examsystem.exam.repository.ExamRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Sınavlarla ilgili iş mantığını yöneten servis sınıfı.
 * Sınav oluşturma, güncelleme, silme, başlatma ve listeleme gibi işlemleri içerir.
 */
@Service
@RequiredArgsConstructor
public class ExamService {

    private final ExamRepository examRepository;
    private final ExamMapper examMapper;
    private final CourseService courseService;
    private final CourseAuthorizationService courseAuthorizationService;

    /**
     * Yeni bir sınav oluşturur. Sadece kursun öğretmeni veya ADMIN yetkisine sahip kullanıcılar
     * sınav oluşturabilir. Sınav, varsayılan olarak pasif durumdadır.
     *
     * @param request Sınav oluşturma isteği DTO'su.
     * @return Oluşturulan sınavın yanıt DTO'su.
     * @throws ExamDomainException Yetkilendirme hatası oluşursa.
     */
    @Transactional
    public ExamResponse createExam(ExamCreateRequest request) {
        Course course = courseService.getCourseById(request.getCourseId());

        Long currentUserId = AuthUtil.getCurrentUserId();
        // Kursun öğretmeni veya ADMIN yetkisi kontrolü
        if (!courseAuthorizationService.canModifyCourse(course, currentUserId)) {
            throw new ExamDomainException(ExamDomainErrorCode.UNAUTHORIZED_EXAM_ACCESS);
        }

        Exam exam = new Exam();
        exam.setName(request.getName());
        exam.setDurationInMinutes(request.getDurationInMinutes());
        exam.setCourse(course);
        exam.setActive(false); // Yeni sınavlar varsayılan olarak pasiftir.

        Exam savedExam = examRepository.save(exam);
        return examMapper.toExamResponse(savedExam);
    }

    /**
     * Mevcut bir sınavı günceller. Sadece ilgili kursun öğretmeni veya ADMIN yetkisine sahip kullanıcılar
     * sınavı güncelleyebilir.
     *
     * @param examId Güncellenecek sınavın ID'si.
     * @param request Sınav güncelleme isteği DTO'su.
     * @return Güncellenen sınavın yanıt DTO'su.
     * @throws ExamDomainException Sınav bulunamazsa veya yetkilendirme hatası olursa.
     */
    @Transactional
    public ExamResponse updateExam(Long examId, ExamUpdateRequest request) {
        Exam exam = examRepository.findByIdWithCourse(examId)
                .orElseThrow(() -> new ExamDomainException(ExamDomainErrorCode.EXAM_NOT_FOUND));

        Long currentUserId = AuthUtil.getCurrentUserId();
        if (!courseAuthorizationService.canModifyCourse(exam.getCourse(), currentUserId)) {
            throw new ExamDomainException(ExamDomainErrorCode.UNAUTHORIZED_EXAM_ACCESS);
        }

        exam.setName(request.getName());
        exam.setDurationInMinutes(request.getDurationInMinutes());

        Exam updatedExam = examRepository.save(exam);
        return examMapper.toExamResponse(updatedExam);
    }

    /**
     * Bir sınavı siler. Sadece ilgili kursun öğretmeni veya ADMIN yetkisine sahip kullanıcılar
     * sınavı silebilir.
     *
     * @param examId Silinecek sınavın ID'si.
     * @throws ExamDomainException Sınav bulunamazsa veya yetkilendirme hatası olursa.
     */
    @Transactional
    public void deleteExam(Long examId) {
        Exam exam = examRepository.findByIdWithCourse(examId)
                .orElseThrow(() -> new ExamDomainException(ExamDomainErrorCode.EXAM_NOT_FOUND));

        Long currentUserId = AuthUtil.getCurrentUserId();
        if (!courseAuthorizationService.canModifyCourse(exam.getCourse(), currentUserId)) {
            throw new ExamDomainException(ExamDomainErrorCode.UNAUTHORIZED_EXAM_ACCESS);
        }

        examRepository.delete(exam);
    }

    /**
     * Bir sınavı başlatır. Sadece kursun öğretmeni veya ADMIN yetkisine sahip kullanıcılar
     * sınavı başlatabilir.
     *
     * @param examId Başlatılacak sınavın ID'si.
     * @return Başlatılan sınavın yanıt DTO'su.
     */
    @Transactional
    public ExamResponse startExam(Long examId) {
        Exam exam = examRepository.findByIdWithCourse(examId)
                .orElseThrow(() -> new ExamDomainException(ExamDomainErrorCode.EXAM_NOT_FOUND));

        Long currentUserId = AuthUtil.getCurrentUserId();
        if (!courseAuthorizationService.canModifyCourse(exam.getCourse(), currentUserId)) {
            throw new ExamDomainException(ExamDomainErrorCode.UNAUTHORIZED_EXAM_ACCESS);
        }

        exam.setActive(true);
        exam.setStartTime(LocalDateTime.now());
        Exam startedExam = examRepository.save(exam);
        return examMapper.toExamResponse(startedExam);
    }

    /**
     * Belirli bir ID'ye sahip sınavı getirir ve DTO'ya dönüştürür.
     * Bu metot genellikle Controller katmanından çağrılır.
     *
     * @param examId Sınav ID'si.
     * @return Sınav yanıt DTO'su.
     * @throws ExamDomainException Sınav bulunamazsa.
     */
    @Transactional(readOnly = true)
    public ExamResponse getExamResponseById(Long examId) {
        Exam exam = getExamById(examId);
        return examMapper.toExamResponse(exam);
    }

    /**
     * Yardımcı Metot: Belirli bir ID'ye sahip sınavı getirir.
     * Bu metot, diğer servislerde yardımcı metot olarak kullanılmak üzere tasarlanmıştır.
     * DTO dönüşümü yapmaz, doğrudan Exam entity'sini döner.
     *
     * @param examId Sınav ID'si.
     * @return Exam entity'si.
     * @throws ExamDomainException Sınav bulunamazsa.
     */
    @Transactional(readOnly = true)
    public Exam getExamById(Long examId) {
        Exam exam = examRepository.findByIdWithCourse(examId)
                .orElseThrow(() -> new ExamDomainException(ExamDomainErrorCode.EXAM_NOT_FOUND));
        // Sınav süresi dolduysa pasif hale getir ve güncel nesneyi kullan
        return checkAndDeactivateExpiredExam(exam);
    }

    /**
     * Yardımcı Metot: Belirli bir ID'ye sahip sınavı getirir.
     * Bu metot, diğer servislerde yardımcı metot olarak kullanılmak üzere tasarlanmıştır.
     * DTO dönüşümü yapmaz, doğrudan Exam entity'sini döner.
     *
     * @param examId Sınav ID'si.
     * @return Exam entity'si.
     * @throws ExamDomainException Sınav bulunamazsa.
     */
    @Transactional(readOnly = true)
    public Exam getExamByIdWithCourse(Long examId) {
        Exam exam = examRepository.findByIdWithCourse(examId)
                .orElseThrow(() -> new ExamDomainException(ExamDomainErrorCode.EXAM_NOT_FOUND));
        // Sınav süresi dolduysa pasif hale getir ve güncel nesneyi kullan
        return checkAndDeactivateExpiredExam(exam);
    }

    /**
     * Sınavları ad, aktiflik durumu ve ders ID'ye göre filtreleyerek sayfalı olarak listeler.
     * Her sınav için süre kontrolü yaparak süresi dolmuş sınavları pasifize eder.
     * Herkes erişebilir.
     *
     * @param name Sınav adının bir kısmı (null olabilir).
     * @param isActive Aktiflik durumu (null olabilir).
     * @param courseId Ders ID'si (null olabilir).
     * @param pageable Sayfalama bilgileri.
     * @return Filtrelenmiş sınavların sayfalı listesi.
     */
    @Transactional
    public PageResponse<ExamResponse> searchExams(String name, Boolean isActive, Long courseId, Pageable pageable) {
        // CourseId varsa, varlığını kontrol et
        if (courseId != null) {
            courseService.validateCourseExistence(courseId);
        }
        Page<Exam> examsPage = examRepository.searchExams(name, isActive, courseId, pageable);
        
        // Her sınav için süre kontrolü yap ve gerekirse pasifize et
        List<Exam> updatedExams = examsPage.getContent().stream()
                .map(this::checkAndDeactivateExpiredExam)
                .collect(Collectors.toList());
        
        return PageResponse.fromPage(examsPage, examMapper.toExamResponseList(updatedExams));
    }

    /**
     * Belirli bir derse ait tüm sınavları sayfalı olarak listeler. Herkes erişebilir.
     * Her sınav için süre kontrolü yaparak süresi dolmuş sınavları pasifize eder.
     *
     * @param courseId Ders ID'si.
     * @param pageable Sayfalama bilgileri.
     * @return Belirtilen derse ait sınavların sayfalı listesi.
     */
    @Transactional
    public PageResponse<ExamResponse> getExamsByCourseId(Long courseId, Pageable pageable) {
        courseService.validateCourseExistence(courseId);
        Page<Exam> examsPage = examRepository.findByCourseId(courseId, pageable);
        
        // Her sınav için süre kontrolü yap ve gerekirse pasifize et
        List<Exam> updatedExams = examsPage.getContent().stream()
                .map(this::checkAndDeactivateExpiredExam)
                .collect(Collectors.toList());
        
        return PageResponse.fromPage(examsPage, examMapper.toExamResponseList(updatedExams));
    }

    /**
     * Yardımcı Metot: Öğrencinin bir sınava erişim yetkisini kontrol eden yardımcı metot.
     * Sınavın aktif ve süresinin dolmamış olması gerekir.
     * @param exam Sınav nesnesi.
     * @return Erişime izin veriliyorsa true, aksi takdirde false.
     */
    public boolean canStudentAccessExam(Exam exam) {
        // Sınav süresi dolduysa pasif hale getir ve güncel nesneyi kullan
        exam = checkAndDeactivateExpiredExam(exam);

        // Sınav aktif değilse veya başlangıç zamanı yoksa
        if (!exam.isActive() || exam.getStartTime() == null) {
            // Sınav aktif değilse, süresi dolmuştur veya hiç başlatılmamıştır.
            // Bu durumu yeni bir hata kodu ile belirtmek daha doğru olacaktır.
            throw new ExamDomainException(ExamDomainErrorCode.EXAM_EXPIRED);
        }

        LocalDateTime endTime = exam.getStartTime().plusMinutes(exam.getDurationInMinutes());
        return LocalDateTime.now().isBefore(endTime);
    }

    /**
     * Yardımcı Metot: Bir sınavın süresinin dolup dolmadığını kontrol eder ve dolduysa pasif hale getirir.
     * Güncellenen sınav nesnesini döndürür.
     * @param exam Kontrol edilecek sınav nesnesi.
     * @return Güncellenen sınav nesnesi.
     */
    private Exam checkAndDeactivateExpiredExam(Exam exam) {
        // Sınav aktifse ve başlangıç zamanı varsa kontrol et
        if (exam.isActive() && exam.getStartTime() != null) {
            LocalDateTime endTime = exam.getStartTime().plusMinutes(exam.getDurationInMinutes());
            if (LocalDateTime.now().isAfter(endTime)) {
                // Sınav süresi doldu, pasif hale getir ve kaydet.
                exam.setActive(false);
                return examRepository.save(exam);
            }
        }
        return exam;
    }
}
