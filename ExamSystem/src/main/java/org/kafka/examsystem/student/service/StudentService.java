package org.kafka.examsystem.student.service;

import lombok.RequiredArgsConstructor;
import org.kafka.examsystem.common.dto.PageResponse;
import org.kafka.examsystem.parent.model.Parent;
import org.kafka.examsystem.student.dto.StudentMinimalResponse;
import org.kafka.examsystem.student.mapper.StudentMapper;
import org.kafka.examsystem.student.model.Student;
import org.kafka.examsystem.student.repository.StudentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.kafka.examsystem.student.exception.domain.StudentDomainErrorCode;
import org.kafka.examsystem.student.exception.domain.StudentDomainException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final StudentMapper studentMapper;

    /**
     * Öğrenci ID'sine göre öğrenciyi getirir.
     */
    @Transactional(readOnly = true)
    public Student getStudentById(Long studentId) {
        return studentRepository.findById(studentId)
                .orElseThrow(() -> new StudentDomainException(StudentDomainErrorCode.STUDENT_NOT_FOUND));
    }

    /**
     * Kullanıcı ID'sine göre öğrenciyi getirir.
     */
    @Transactional(readOnly = true)
    public Student getStudentByUserId(Long userId) {
        return studentRepository.findByUserId(userId)
                .orElseThrow(() -> new StudentDomainException(StudentDomainErrorCode.STUDENT_NOT_FOUND));
    }

    /**
     * Belirli bir veliye ait tüm öğrencileri getirir.
     *
     * @param parent Veli nesnesi.
     * @return Veliye ait öğrencilerin listesi.
     */
    @Transactional(readOnly = true)
    public List<Student> getStudentsByParent(Parent parent) {
        return studentRepository.findByParent(parent);
    }

    /**
     * Öğrencileri ad, soyad ve sınıf düzeyine göre arar ve sonuçları sayfalı olarak getirir.
     *
     * @param firstName Öğrenci adının bir kısmı (null olabilir).
     * @param lastName Öğrenci soyadının bir kısmı (null olabilir).
     * @param gradeLevel Öğrencinin sınıf düzeyi (null olabilir).
     * @param pageable Sayfalama ve sıralama bilgileri.
     * @return Filtrelenmiş ve sayfalı StudentMinimalResponse listesi.
     */
    @Transactional(readOnly = true)
    public PageResponse<StudentMinimalResponse> searchStudents(String firstName, String lastName, Integer gradeLevel, Pageable pageable) {
        Page<Student> studentsPage = studentRepository.searchStudents(firstName, lastName, gradeLevel, pageable);
        List<StudentMinimalResponse> content = studentMapper.toMinimalResponseList(studentsPage.getContent());
        return PageResponse.fromPage(studentsPage, content);
    }
}
