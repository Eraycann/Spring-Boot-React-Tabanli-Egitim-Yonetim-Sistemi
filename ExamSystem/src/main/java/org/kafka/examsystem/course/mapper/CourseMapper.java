package org.kafka.examsystem.course.mapper;

import org.kafka.examsystem.common.dto.PageResponse;
import org.kafka.examsystem.course.dto.CourseResponse;
import org.kafka.examsystem.course.model.Course;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Course entity'si ile CourseResponse DTO'su arasında dönüşüm yapan MapStruct mapper arayüzü.
 * Spring bileşeni olarak kullanılacak şekilde yapılandırılmıştır.
 */
@Mapper(componentModel = "spring") // Spring tarafından yönetilen bir bean olmasını sağlar
public interface CourseMapper {

    /**
     * Course entity'sini CourseResponse DTO'suna dönüştürür.
     * Teacher nesnesinin içindeki alanları CourseResponse'a doğru şekilde eşler.
     *
     * @param course Dönüştürülecek Course entity'si.
     * @return Dönüştürülmüş CourseResponse DTO'su.
     */
    @Mapping(source = "teacher.id", target = "teacherId")
    @Mapping(source = "teacher.firstName", target = "teacherFirstName")
    @Mapping(source = "teacher.lastName", target = "teacherLastName")
    CourseResponse toCourseResponse(Course course);

    /**
     * Course entity listesini CourseResponse DTO listesine dönüştürür.
     *
     * @param courses Dönüştürülecek Course entity listesi.
     * @return Dönüştürülmüş CourseResponse DTO listesi.
     */
    List<CourseResponse> toCourseResponseList(List<Course> courses);
}
