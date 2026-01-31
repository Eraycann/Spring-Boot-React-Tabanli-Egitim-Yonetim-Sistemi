package org.kafka.examsystem.topic.mapper;

import org.kafka.examsystem.topic.dto.TopicResponse;
import org.kafka.examsystem.topic.model.Topic;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;

/**
 * Topic varlığı ile DTO'lar arasında dönüşüm sağlayan MapStruct Mapper.
 */
@Mapper(componentModel = "spring")
public interface TopicMapper {

    @Mapping(target = "courseId", source = "course.id")
    @Mapping(target = "courseName", source = "course.name")
    TopicResponse toTopicResponse(Topic topic);

    List<TopicResponse> toTopicResponseList(List<Topic> topics);
}