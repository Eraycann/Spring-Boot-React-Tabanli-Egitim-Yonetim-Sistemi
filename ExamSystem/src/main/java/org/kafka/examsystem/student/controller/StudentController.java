package org.kafka.examsystem.student.controller;

import lombok.RequiredArgsConstructor;
import org.kafka.examsystem.common.dto.PageResponse;
import org.kafka.examsystem.student.dto.StudentMinimalResponse;
import org.kafka.examsystem.student.service.StudentService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Öğrenciyle ilgili API isteklerini yöneten REST kontrolcü sınıfı.
 */
@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    /**
     * Öğrencileri ad, soyad veya sınıf düzeyine göre arar.
     *
     * @param firstName Öğrenci adının bir kısmı (isteğe bağlı).
     * @param lastName Öğrenci soyadının bir kısmı (isteğe bağlı).
     * @param gradeLevel Öğrencinin sınıf düzeyi (isteğe bağlı).
     * @param pageable Sayfalama ve sıralama bilgileri.
     * @return Filtrelenmiş ve sayfalı StudentMinimalResponse listesi.
     */
    @GetMapping("/search")
    public ResponseEntity<PageResponse<StudentMinimalResponse>> searchStudents(
            @RequestParam(required = false) String firstName,
            @RequestParam(required = false) String lastName,
            @RequestParam(required = false) Integer gradeLevel,
            @PageableDefault(size = 10, sort = "firstName", direction = Sort.Direction.ASC) Pageable pageable) {
        PageResponse<StudentMinimalResponse> students = studentService.searchStudents(firstName, lastName, gradeLevel, pageable);
        return ResponseEntity.ok(students);
    }
}
