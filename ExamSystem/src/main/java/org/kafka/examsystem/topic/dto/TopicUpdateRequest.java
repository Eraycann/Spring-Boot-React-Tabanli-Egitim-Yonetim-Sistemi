package org.kafka.examsystem.topic.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Konuyu güncellemek için kullanılan DTO.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TopicUpdateRequest {
    private String name;
}