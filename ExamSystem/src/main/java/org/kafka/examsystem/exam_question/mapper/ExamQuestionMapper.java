package org.kafka.examsystem.exam_question.mapper;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.kafka.examsystem.exam_question.dto.ExamQuestionCreateRequest;
import org.kafka.examsystem.exam_question.dto.ExamQuestionResponse;
import org.kafka.examsystem.exam_question.dto.ExamQuestionUpdateRequest;
import org.kafka.examsystem.exam_question.exception.domain.ExamQuestionDomainErrorCode;
import org.kafka.examsystem.exam_question.exception.domain.ExamQuestionDomainException;
import org.kafka.examsystem.exam_question.model.ExamQuestion;
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;

@Mapper(componentModel = "spring")
public abstract class ExamQuestionMapper {

    @Autowired
    protected ObjectMapper objectMapper;

    @Mapping(target = "options", source = "options", qualifiedByName = "listToJson")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "exam", ignore = true)
    @Mapping(target = "topic", ignore = true)
    public abstract ExamQuestion toExamQuestion(ExamQuestionCreateRequest request);

    @Mapping(target = "examId", source = "exam.id")
    @Mapping(target = "topicName", source = "topic.name")
    @Mapping(target = "options", source = "options", qualifiedByName = "jsonToList")
    public abstract ExamQuestionResponse toExamQuestionResponse(ExamQuestion examQuestion);

    public abstract List<ExamQuestionResponse> toExamQuestionResponseList(List<ExamQuestion> examQuestions);

    @Mapping(target = "options", source = "options", qualifiedByName = "listToJson")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "exam", ignore = true)
    @Mapping(target = "topic", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    public abstract void updateExamQuestionFromDto(ExamQuestionUpdateRequest dto, @MappingTarget ExamQuestion entity);

    @Named("listToJson")
    protected String listToJson(List<String> options) {
        if (options == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(options);
        } catch (JsonProcessingException e) {
            throw new ExamQuestionDomainException(ExamQuestionDomainErrorCode.JSON_PROCESSING_ERROR);
        }
    }

    @Named("jsonToList")
    protected List<String> jsonToList(String json) {
        if (json == null) {
            return null;
        }
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (JsonProcessingException e) {
            throw new ExamQuestionDomainException(ExamQuestionDomainErrorCode.JSON_PROCESSING_ERROR);
        }
    }
}
