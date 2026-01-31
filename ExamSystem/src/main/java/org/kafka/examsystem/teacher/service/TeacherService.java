package org.kafka.examsystem.teacher.service;

import lombok.RequiredArgsConstructor;
import org.kafka.examsystem.teacher.exception.domain.TeacherDomainErrorCode;
import org.kafka.examsystem.teacher.exception.domain.TeacherDomainException;
import org.kafka.examsystem.teacher.model.Teacher;
import org.kafka.examsystem.teacher.repository.TeacherRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TeacherService {

    private final TeacherRepository teacherRepository;

    @Transactional(readOnly = true)
    public Teacher getTeacherById(Long teacherId) {
        return teacherRepository.findById(teacherId)
                .orElseThrow(() -> new TeacherDomainException(TeacherDomainErrorCode.TEACHER_NOT_FOUND));
    }

    @Transactional(readOnly = true)
    public Teacher getTeacherByUserId(Long userId) {
        return teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new TeacherDomainException(TeacherDomainErrorCode.TEACHER_NOT_FOUND));
    }
}
