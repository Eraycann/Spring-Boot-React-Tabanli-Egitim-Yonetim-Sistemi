package org.kafka.examsystem.topic.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Yeni bir konu oluşturmak için kullanılan DTO.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TopicCreateRequest {
    private String name;
    private Long courseId;
}
