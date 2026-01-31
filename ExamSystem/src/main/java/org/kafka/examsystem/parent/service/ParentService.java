package org.kafka.examsystem.parent.service;

import lombok.RequiredArgsConstructor;
import org.kafka.examsystem.course.exception.domain.CourseDomainErrorCode;
import org.kafka.examsystem.course.exception.domain.CourseDomainException;
import org.kafka.examsystem.parent.exception.domain.ParentDomainErrorCode;
import org.kafka.examsystem.parent.exception.domain.ParentDomainException;
import org.kafka.examsystem.parent.model.Parent;
import org.kafka.examsystem.parent.repository.ParentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ParentService {

    private final ParentRepository parentRepository;

    @Transactional(readOnly = true)
    public Parent getParentById(Long parentId) {
        return parentRepository.findById(parentId)
                .orElseThrow(() -> new ParentDomainException(ParentDomainErrorCode.PARENT_NOT_FOUND));
    }

    @Transactional(readOnly = true)
    public Parent getParentByUserId(Long userId) {
        return parentRepository.findByUserId(userId)
                .orElseThrow(() -> new ParentDomainException(ParentDomainErrorCode.PARENT_NOT_FOUND));
    }
}
