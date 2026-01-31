package org.kafka.examsystem.exam_submission.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * İstemciye dönülecek sınav girişi bilgilerini içeren DTO.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExamSubmissionResponse {
    private Long id;
    private Long examId;
    private String examName;
    private Long studentId;
    private String studentName;
    private LocalDateTime submittedAt;
    private Double totalScore;
}