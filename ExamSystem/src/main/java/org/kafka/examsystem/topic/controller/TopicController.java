package org.kafka.examsystem.topic.controller;

import lombok.RequiredArgsConstructor;
import org.kafka.examsystem.common.dto.PageResponse;
import org.kafka.examsystem.topic.dto.TopicCreateRequest;
import org.kafka.examsystem.topic.dto.TopicResponse;
import org.kafka.examsystem.topic.dto.TopicUpdateRequest;
import org.kafka.examsystem.topic.service.TopicService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

/**
 * Konu kaynakları için REST API uç noktalarını yöneten controller sınıfı.
 * RESTful adlandırma standartlarına uygun olarak tasarlanmıştır.
 */
@RestController
@RequestMapping("/api") // Base path'i '/api' olarak ayırıp kaynak bazlı routing'i alt katmanlara bıraktık
@RequiredArgsConstructor
public class TopicController {

    private final TopicService topicService;

    /**
     * Yeni bir konu oluşturur.
     * Sadece ROLE_TEACHER veya ROLE_ADMIN rolüne sahip kullanıcılar erişebilir.
     * RESTful: POST /api/topics
     * @param request Konu oluşturma isteği DTO'su.
     * @return Oluşturulan konunun yanıtı ve HTTP 201 Created durumu.
     */
    @PostMapping("/topics")
    @PreAuthorize("hasAnyRole('ROLE_TEACHER', 'ROLE_ADMIN')")
    public ResponseEntity<TopicResponse> createTopic(@RequestBody TopicCreateRequest request) {
        TopicResponse createdTopic = topicService.createTopic(request);
        return new ResponseEntity<>(createdTopic, HttpStatus.CREATED);
    }

    /**
     * Mevcut bir konuyu günceller.
     * Sadece kursun öğretmeni veya ADMIN rolüne sahip kullanıcılar erişebilir.
     * RESTful: PUT /api/topics/{topicId}
     * @param topicId Güncellenecek konunun ID'si.
     * @param request Konu güncelleme isteği DTO'su.
     * @return Güncellenen konunun yanıtı ve HTTP 200 OK durumu.
     */
    @PutMapping("/topics/{topicId}")
    @PreAuthorize("hasAnyRole('ROLE_TEACHER', 'ROLE_ADMIN')")
    public ResponseEntity<TopicResponse> updateTopic(@PathVariable Long topicId, @RequestBody TopicUpdateRequest request) {
        TopicResponse updatedTopic = topicService.updateTopic(topicId, request);
        return ResponseEntity.ok(updatedTopic);
    }

    /**
     * Bir konuyu siler.
     * Sadece kursun öğretmeni veya ADMIN rolüne sahip kullanıcılar erişebilir.
     * RESTful: DELETE /api/topics/{topicId}
     * @param topicId Silinecek konunun ID'si.
     * @return Boş yanıt ve HTTP 204 No Content durumu.
     */
    @DeleteMapping("/topics/{topicId}")
    @PreAuthorize("hasAnyRole('ROLE_TEACHER', 'ROLE_ADMIN')")
    public ResponseEntity<Void> deleteTopic(@PathVariable Long topicId) {
        topicService.deleteTopic(topicId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Belirli bir konuyu ID'sine göre getirir.
     * Herkes erişebilir.
     * RESTful: GET /api/topics/{topicId}
     * @param topicId Getirilecek konunun ID'si.
     * @return Konu yanıtı ve HTTP 200 OK durumu.
     */
    @GetMapping("/topics/{topicId}")
    public ResponseEntity<TopicResponse> getTopicById(@PathVariable Long topicId) {
        TopicResponse topic = topicService.getTopicById(topicId);
        return ResponseEntity.ok(topic);
    }

    /**
     * Tüm konuları listeler ve ad, kurs ID'ye göre filtreleme yapabilir.
     * Herkes erişebilir.
     * RESTful: GET /api/topics?name=...&courseId=...
     * @param name Konu adının bir kısmı (opsiyonel).
     * @param courseId Kurs ID'si (opsiyonel).
     * @param pageable Sayfalama bilgileri.
     * @return Filtrelenmiş ve sayfalı konu listesi ve HTTP 200 OK durumu.
     */
    @GetMapping("/topics")
    public ResponseEntity<PageResponse<TopicResponse>> searchTopics(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long courseId,
            @PageableDefault(size = 10, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        PageResponse<TopicResponse> topics = topicService.searchTopics(name, courseId, pageable);
        return ResponseEntity.ok(topics);
    }

    /**
     * Bir kursa ait konuları listeler.
     * RESTful: GET /api/courses/{courseId}/topics
     * @param courseId Kursun ID'si.
     * @param pageable Sayfalama bilgileri.
     * @return Bir kursa ait sayfalı konu listesi ve HTTP 200 OK durumu.
     */
    @GetMapping("/courses/{courseId}/topics")
    public ResponseEntity<PageResponse<TopicResponse>> getTopicsByCourse(
            @PathVariable Long courseId,
            @PageableDefault(size = 10, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        PageResponse<TopicResponse> topics = topicService.getTopicsByCourseId(courseId, pageable);
        return ResponseEntity.ok(topics);
    }
}
