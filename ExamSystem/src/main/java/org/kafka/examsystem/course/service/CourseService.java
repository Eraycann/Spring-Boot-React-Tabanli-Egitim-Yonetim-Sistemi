package org.kafka.examsystem.course.service;

import lombok.RequiredArgsConstructor;
import org.kafka.examsystem.common.authorization.CourseAuthorizationService;
import org.kafka.examsystem.common.dto.PageResponse;
import org.kafka.examsystem.common.util.AuthUtil;
import org.kafka.examsystem.course.dto.CourseCreateRequest;
import org.kafka.examsystem.course.dto.CourseResponse;
import org.kafka.examsystem.course.dto.CourseUpdateRequest;
import org.kafka.examsystem.course.exception.domain.CourseDomainErrorCode;
import org.kafka.examsystem.course.exception.domain.CourseDomainException;
import org.kafka.examsystem.course.exception.validation.CourseValidationErrorCode;
import org.kafka.examsystem.course.exception.validation.CourseValidationException;
import org.kafka.examsystem.course.mapper.CourseMapper;
import org.kafka.examsystem.course.model.Course;
import org.kafka.examsystem.course.repository.CourseRepository;
import org.kafka.examsystem.teacher.model.Teacher;
import org.kafka.examsystem.teacher.service.TeacherService; // Yeni bağımlılık
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Kurslarla ilgili temel iş mantığını yöneten servis sınıfı.
 * Kurs oluşturma, güncelleme, silme ve listeleme gibi işlemleri içerir.
 * Yetkilendirme ve diğer varlıkların bulunması gibi görevler ilgili servislere delege edilmiştir.
 * MapStruct ile DTO dönüşümleri sağlar.
 * Sayfalama (Pagination) ve N+1 sorgu optimizasyonları yapılmıştır.
 */
@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final TeacherService teacherService;
    private final CourseMapper courseMapper;
    private final CourseAuthorizationService courseAuthorizationService;

    /**
     * Yeni bir kurs oluşturur. Sadece ROLE_TEACHER rolüne sahip kullanıcılar kurs oluşturabilir.
     * Oluşturulan kurs, giriş yapmış öğretmene atanır.
     *
     * @param request Kurs oluşturma isteği DTO'su.
     * @return Oluşturulan kursun yanıt DTO'su.
     * @throws CourseDomainException Öğretmen bulunamazsa veya yetkilendirme hatası olursa.
     */
    @Transactional
    public CourseResponse createCourse(CourseCreateRequest request) {
        if (!AuthUtil.hasRole("ROLE_TEACHER")) {
            throw new CourseDomainException(CourseDomainErrorCode.UNAUTHORIZED_COURSE_ACCESS);
        }

        Long currentTeacherUserId = AuthUtil.getCurrentUserId();
        if (currentTeacherUserId == null) {
            throw new CourseDomainException(CourseDomainErrorCode.UNAUTHORIZED_COURSE_ACCESS);
        }

        Teacher teacher = teacherService.getTeacherByUserId(currentTeacherUserId);

        Course course = new Course();
        course.setName(request.getName());
        course.setTeacher(teacher);
        course.setGradeLevel(request.getGradeLevel());

        try {
            Course savedCourse = courseRepository.save(course);
            return courseMapper.toCourseResponse(savedCourse);
        } catch (DataIntegrityViolationException e) {
            throw new CourseValidationException(CourseValidationErrorCode.COURSE_NAME_ALREADY_EXISTS);
        }
    }

    /**
     * Bir kursu günceller. Sadece kursu oluşturan öğretmen veya ADMIN güncelleyebilir.
     * Yetkilendirme kontrolü CourseAuthorizationService'e delege edilmiştir.
     *
     * @param courseId Güncellenecek kursun ID'si.
     * @param request Kurs güncelleme isteği DTO'su.
     * @return Güncellenen kursun yanıt DTO'su.
     * @throws CourseDomainException Kurs bulunamazsa veya yetkilendirme hatası olursa.
     */
    @Transactional
    public CourseResponse updateCourse(Long courseId, CourseUpdateRequest request) {
        if (courseId == null) {
            throw new CourseValidationException(CourseValidationErrorCode.COURSE_ID_MUST_NOT_BE_NULL);
        }

        Course course = courseRepository.findByIdWithTeacherAndUser(courseId)
                .orElseThrow(() -> new CourseDomainException(CourseDomainErrorCode.COURSE_NOT_FOUND));

        Long currentUserId = AuthUtil.getCurrentUserId();

        if (!courseAuthorizationService.canModifyCourse(course, currentUserId)) {
            throw new CourseDomainException(CourseDomainErrorCode.UNAUTHORIZED_COURSE_ACCESS);
        }

        course.setName(request.getName());
        course.setGradeLevel(request.getGradeLevel());

        try {
            Course updatedCourse = courseRepository.save(course);
            return courseMapper.toCourseResponse(updatedCourse);
        } catch (DataIntegrityViolationException e) {
            throw new CourseValidationException(CourseValidationErrorCode.COURSE_NAME_ALREADY_EXISTS);
        }
    }

    /**
     * Bir kursu siler. Sadece kursu oluşturan öğretmen veya ADMIN silebilir.
     * Yetkilendirme kontrolü CourseAuthorizationService'e delege edilmiştir.
     *
     * @param courseId Silinecek kursun ID'si.
     * @throws CourseDomainException Kurs bulunamazsa veya yetkilendirme hatası olursa.
     */
    @Transactional
    public void deleteCourse(Long courseId) {
        if (courseId == null) {
            throw new CourseValidationException(CourseValidationErrorCode.COURSE_ID_MUST_NOT_BE_NULL);
        }

        Course course = courseRepository.findByIdWithTeacherAndUser(courseId)
                .orElseThrow(() -> new CourseDomainException(CourseDomainErrorCode.COURSE_NOT_FOUND));

        Long currentUserId = AuthUtil.getCurrentUserId();

        if (!courseAuthorizationService.canModifyCourse(course, currentUserId)) {
            throw new CourseDomainException(CourseDomainErrorCode.UNAUTHORIZED_COURSE_ACCESS);
        }

        courseRepository.delete(course);
    }

    /**
     * Tüm kursları sayfalı olarak listeler.
     * N+1 sorgu problemini önlemek için findAllWithTeacherAndUser kullanılır.
     * DTO dönüşümü için mapper'ın list dönüştürme metodu kullanılır ve paginasyon bilgisi serviste eklenir.
     *
     * @param pageable Sayfalama bilgileri (sayfa numarası, sayfa boyutu, sıralama).
     * @return Kurs yanıt DTO'larının sayfalı listesi.
     */
    public PageResponse<CourseResponse> getAllCourses(Pageable pageable) {
        Page<Course> coursesPage = courseRepository.findAllWithTeacherAndUser(pageable);
        List<CourseResponse> content = courseMapper.toCourseResponseList(coursesPage.getContent());
        return PageResponse.fromPage(coursesPage, content);
    }


    /**
     * Belirli bir ID'ye sahip kursu getirir ve CourseResponse DTO'suna dönüştürür.
     * Bu metot genellikle Controller katmanından çağrılır.
     *
     * @param courseId Kursun ID'si.
     * @return Kurs yanıt DTO'su.
     * @throws CourseDomainException Kurs bulunamazsa.
     */
    public CourseResponse getCourseResponseById(Long courseId) {
        if (courseId == null) {
            throw new CourseValidationException(CourseValidationErrorCode.COURSE_ID_MUST_NOT_BE_NULL);
        }
        Course course = getCourseById(courseId); // İç helper metodu çağırır.
        return courseMapper.toCourseResponse(course);
    }

    /**
     * Yardımcı Metot: Belirli bir ID'ye sahip kursu getirir.
     * Bu metot, diğer servislerde yardımcı metot olarak kullanılmak üzere tasarlanmıştır.
     * DTO dönüşümü yapmaz, doğrudan Course entity'sini döner.
     *
     * @param courseId Kursun ID'si.
     * @return Course entity'si.
     * @throws CourseDomainException Kurs bulunamazsa.
     */
    @Transactional(readOnly = true)
    public Course getCourseById(Long courseId) {
        if (courseId == null) {
            throw new CourseValidationException(CourseValidationErrorCode.COURSE_ID_MUST_NOT_BE_NULL);
        }
        return courseRepository.findByIdWithTeacherAndUser(courseId)
                .orElseThrow(() -> new CourseDomainException(CourseDomainErrorCode.COURSE_NOT_FOUND));
    }

    /**
     * Giriş yapmış öğretmene ait kursları sayfalı olarak listeler.
     * N+1 sorgu problemini önlemek için findByTeacherWithTeacherAndUser kullanılır.
     * DTO dönüşümü için mapper'ın list dönüştürme metodu kullanılır ve paginasyon bilgisi serviste eklenir.
     *
     * @param pageable Sayfalama bilgileri (sayfa numarası, sayfa boyutu, sıralama).
     * @return Öğretmene ait kurs yanıt DTO'larının sayfalı listesi.
     * @throws CourseDomainException Öğretmen bulunamazsa veya yetkilendirme hatası olursa.
     */
    public PageResponse<CourseResponse> getCoursesByCurrentTeacher(Pageable pageable) {
        if (!AuthUtil.hasRole("ROLE_TEACHER")) {
            throw new CourseDomainException(CourseDomainErrorCode.UNAUTHORIZED_COURSE_ACCESS);
        }

        Long currentTeacherUserId = AuthUtil.getCurrentUserId();
        if (currentTeacherUserId == null) {
            throw new CourseDomainException(CourseDomainErrorCode.UNAUTHORIZED_COURSE_ACCESS);
        }

        Teacher teacher = teacherService.getTeacherByUserId(currentTeacherUserId);

        Page<Course> coursesPage = courseRepository.findByTeacherWithTeacherAndUser(teacher, pageable);
        List<CourseResponse> content = courseMapper.toCourseResponseList(coursesPage.getContent());
        return PageResponse.fromPage(coursesPage, content);
    }

    /**
     * Kursları, isim ve sınıf seviyesi filtrelemesiyle sayfalı olarak arar.
     * N+1 sorgu problemini önlemek için ilişkili öğretmen ve kullanıcı nesneleri JOIN FETCH ile birlikte getirilir.
     * DTO dönüşümü için mapper'ın list dönüştürme metodu kullanılır ve paginasyon bilgisi serviste eklenir.
     *
     * @param name       Kurs adının bir kısmı (kısmi ve büyük/küçük harf duyarsız arama için), null olabilir.
     * @param gradeLevel Kursun sınıf seviyesi (tam eşleşme için), null olabilir.
     * @param pageable   Sayfalama bilgileri (sayfa numarası, sayfa boyutu, sıralama).
     * @return Filtrelenmiş kursların yanıt DTO'larının sayfalı listesi.
     */
    public PageResponse<CourseResponse> searchCourses(String name, Integer gradeLevel, Pageable pageable) {
        Page<Course> coursesPage = courseRepository.searchCourses(name, gradeLevel, pageable);
        List<CourseResponse> content = courseMapper.toCourseResponseList(coursesPage.getContent());
        return PageResponse.fromPage(coursesPage, content);
    }


    /**
     * Yardımcı metot: Belirli bir ID'ye sahip kursu, ilişkili öğretmen ve kullanıcı verileriyle birlikte getirir.
     *
     * @param courseId Kursun ID'si.
     * @return Kurs varlığı.
     * @throws CourseDomainException Kurs bulunamazsa.
     */
    @Transactional(readOnly = true)
    public Course getCourseByIdWithTeacherAndUser(Long courseId) {
        return courseRepository.findByIdWithTeacherAndUser(courseId)
                .orElseThrow(() -> new CourseDomainException(CourseDomainErrorCode.COURSE_NOT_FOUND));
    }

    /**
     * Yardımcı metot: Belirli bir kursun var olup olmadığını kontrol eder ve
     * var değilse bir istisna fırlatır.
     *
     * @param courseId Kontrol edilecek kursun ID'si.
     * @throws CourseDomainException Kurs bulunamazsa.
     */
    @Transactional(readOnly = true)
    public void validateCourseExistence(Long courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new CourseDomainException(CourseDomainErrorCode.COURSE_NOT_FOUND);
        }
    }
}
