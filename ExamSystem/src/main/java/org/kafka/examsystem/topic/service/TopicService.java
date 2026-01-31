package org.kafka.examsystem.topic.service;

import lombok.RequiredArgsConstructor;
import org.kafka.examsystem.common.dto.PageResponse;
import org.kafka.examsystem.common.util.AuthUtil;
import org.kafka.examsystem.course.model.Course;
import org.kafka.examsystem.course.service.CourseService;
import org.kafka.examsystem.common.authorization.CourseAuthorizationService;
import org.kafka.examsystem.topic.dto.TopicCreateRequest;
import org.kafka.examsystem.topic.dto.TopicResponse;
import org.kafka.examsystem.topic.dto.TopicUpdateRequest;
import org.kafka.examsystem.topic.exception.domain.TopicDomainErrorCode;
import org.kafka.examsystem.topic.exception.domain.TopicDomainException;
import org.kafka.examsystem.topic.exception.validation.TopicValidationErrorCode;
import org.kafka.examsystem.topic.exception.validation.TopicValidationException;
import org.kafka.examsystem.topic.mapper.TopicMapper;
import org.kafka.examsystem.topic.model.Topic;
import org.kafka.examsystem.topic.repository.TopicRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Konularla ilgili iş mantığını yöneten servis sınıfı.
 * Konu oluşturma, güncelleme, silme, arama ve listeleme gibi işlemleri içerir.
 */
@Service
@RequiredArgsConstructor
public class TopicService {

    private final TopicRepository topicRepository;
    private final TopicMapper topicMapper;
    private final CourseService courseService;
    private final CourseAuthorizationService courseAuthorizationService;

    /**
     * Yeni bir konu oluşturur. Sadece kursun öğretmeni veya ADMIN yetkisine sahip kullanıcılar
     * konu oluşturabilir.
     *
     * @param request Konu oluşturma isteği DTO'su.
     * @return Oluşturulan konunun yanıt DTO'su.
     * @throws TopicDomainException Yetkilendirme hatası oluşursa.
     */
    @Transactional
    public TopicResponse createTopic(TopicCreateRequest request) {
        Course course = courseService.getCourseByIdWithTeacherAndUser(request.getCourseId());

        Long currentUserId = AuthUtil.getCurrentUserId();
        if (!courseAuthorizationService.canModifyCourse(course, currentUserId)) {
            throw new TopicDomainException(TopicDomainErrorCode.UNAUTHORIZED_TOPIC_ACCESS);
        }

        Topic topic = new Topic();
        topic.setName(request.getName());
        topic.setCourse(course);

        Topic savedTopic = topicRepository.save(topic);
        return topicMapper.toTopicResponse(savedTopic);
    }

    /**
     * Mevcut bir konuyu günceller. Sadece ilgili kursun öğretmeni veya ADMIN yetkisine sahip kullanıcılar
     * konuyu güncelleyebilir.
     *
     * @param topicId Güncellenecek konunun ID'si.
     * @param request Konu güncelleme isteği DTO'su.
     * @return Güncellenen konunun yanıt DTO'su.
     * @throws TopicDomainException Konu bulunamazsa veya yetkilendirme hatası olursa.
     */
    @Transactional
    public TopicResponse updateTopic(Long topicId, TopicUpdateRequest request) {
        Topic topic = topicRepository.findByIdWithCourse(topicId)
                .orElseThrow(() -> new TopicDomainException(TopicDomainErrorCode.TOPIC_NOT_FOUND));

        Long currentUserId = AuthUtil.getCurrentUserId();
        if (!courseAuthorizationService.canModifyCourse(topic.getCourse(), currentUserId)) {
            throw new TopicDomainException(TopicDomainErrorCode.UNAUTHORIZED_TOPIC_ACCESS);
        }

        topic.setName(request.getName());
        Topic updatedTopic = topicRepository.save(topic);
        return topicMapper.toTopicResponse(updatedTopic);
    }

    /**
     * Bir konuyu siler. Sadece ilgili kursun öğretmeni veya ADMIN yetkisine sahip kullanıcılar
     * konuyu silebilir.
     *
     * @param topicId Silinecek konunun ID'si.
     * @throws TopicDomainException Konu bulunamazsa veya yetkilendirme hatası olursa.
     */
    @Transactional
    public void deleteTopic(Long topicId) {
        Topic topic = topicRepository.findByIdWithCourse(topicId)
                .orElseThrow(() -> new TopicDomainException(TopicDomainErrorCode.TOPIC_NOT_FOUND));

        Long currentUserId = AuthUtil.getCurrentUserId();
        if (!courseAuthorizationService.canModifyCourse(topic.getCourse(), currentUserId)) {
            throw new TopicDomainException(TopicDomainErrorCode.UNAUTHORIZED_TOPIC_ACCESS);
        }

        topicRepository.delete(topic);
    }

    /**
     * Belirli bir ID'ye sahip konuyu getirir. Herkes erişebilir.
     *
     * @param topicId Konu ID'si.
     * @return Konu yanıt DTO'su.
     * @throws TopicDomainException Konu bulunamazsa.
     */
    @Transactional(readOnly = true)
    public TopicResponse getTopicById(Long topicId) {
        Topic topic = topicRepository.findByIdWithCourse(topicId)
                .orElseThrow(() -> new TopicDomainException(TopicDomainErrorCode.TOPIC_NOT_FOUND));
        return topicMapper.toTopicResponse(topic);
    }

    /**
     * Yardımcı Metot: Belirli bir ID'ye sahip konuyu getirir.
     * Bu metot, diğer servislerde yardımcı metot olarak kullanılmak üzere tasarlanmıştır.
     * DTO dönüşümü yapmaz, doğrudan Topic entity'sini döner.
     *
     * @param topicId Konu ID'si.
     * @return Topic entity'si.
     * @throws TopicDomainException Konu bulunamazsa.
     */
    @Transactional(readOnly = true)
    public Topic getTopicEntityById(Long topicId) {
        return topicRepository.findById(topicId)
                .orElseThrow(() -> new TopicDomainException(TopicDomainErrorCode.TOPIC_NOT_FOUND));
    }

    /**
     * Konu adı ve kurs ID'ye göre filtrelenmiş tüm konuları sayfalı olarak listeler. Herkes erişebilir.
     *
     * @param name Konu adının bir kısmı (null olabilir).
     * @param courseId Kurs ID'si (null olabilir).
     * @param pageable Sayfalama bilgileri.
     * @return Filtrelenmiş konuların sayfalı listesi.
     */
    @Transactional(readOnly = true)
    public PageResponse<TopicResponse> searchTopics(String name, Long courseId, Pageable pageable) {
        Page<Topic> topicsPage = topicRepository.searchTopics(name, courseId, pageable);
        return PageResponse.fromPage(topicsPage, topicMapper.toTopicResponseList(topicsPage.getContent()));
    }

    /**
     * Belirli bir kursa ait tüm konuları sayfalı olarak listeler. Herkes erişebilir.
     * Bu metot, `TopicRepository.findByCourseId`'yi kullanır.
     *
     * @param courseId Kurs ID'si.
     * @param pageable Sayfalama bilgileri.
     * @return Belirtilen kursa ait konuların sayfalı listesi.
     */
    @Transactional(readOnly = true)
    public PageResponse<TopicResponse> getTopicsByCourseId(Long courseId, Pageable pageable) {
        courseService.validateCourseExistence(courseId);
        Page<Topic> topicsPage = topicRepository.findByCourseId(courseId, pageable);
        return PageResponse.fromPage(topicsPage, topicMapper.toTopicResponseList(topicsPage.getContent()));
    }
}
