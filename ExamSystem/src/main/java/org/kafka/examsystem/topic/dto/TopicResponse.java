package org.kafka.examsystem.topic.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * İstemciye dönülecek konu bilgilerini içeren DTO.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TopicResponse {
    private Long id;
    private String name;
    private Long courseId;
    private String courseName;
}