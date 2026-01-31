package org.kafka.examsystem.course_student.mapper;

import org.kafka.examsystem.common.dto.PageResponse;
import org.kafka.examsystem.student.model.Student;
import org.kafka.examsystem.course_student.dto.CourseStudentSummaryDto;
import org.springframework.data.domain.Page;
import org.mapstruct.Mapper;

import java.util.List;

/**
 * Student entity'si ile CourseStudentSummaryDto arasında dönüşüm yapan MapStruct mapper arayüzü.
 * CourseStudent domainine özeldir.
 */
@Mapper(componentModel = "spring")
public interface CourseStudentSummaryMapper {

    CourseStudentSummaryDto toCourseStudentSummaryDto(Student student);

    List<CourseStudentSummaryDto> toCourseStudentSummaryDtoList(List<Student> students);

    default PageResponse<CourseStudentSummaryDto> toCourseStudentSummaryDtoPage(Page<Student> studentPage) {
        List<CourseStudentSummaryDto> content = toCourseStudentSummaryDtoList(studentPage.getContent());
        return PageResponse.fromPage(studentPage, content);
    }
}
