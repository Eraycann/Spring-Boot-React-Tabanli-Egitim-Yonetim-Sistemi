package org.kafka.examsystem.exam_submission.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.kafka.examsystem.exam_submission.model.ExamSubmission;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.time.LocalDateTime;

/**
 * Yeni bir sınav girişi oluşturmak için kullanılan DTO.
 * Sadece sınav ID'si gerekli. Öğrenci ID'si güvenlik bağlamından alınır.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExamSubmissionCreateRequest {
    private Long examId;
}