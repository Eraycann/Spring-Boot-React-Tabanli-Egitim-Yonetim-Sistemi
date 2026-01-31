package org.kafka.examsystem.course_student.mapper;

import org.kafka.examsystem.common.dto.PageResponse;
import org.kafka.examsystem.course.model.Course;
import org.kafka.examsystem.course_student.dto.EnrolledCourseResponse;
import org.springframework.data.domain.Page;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

/**
 * Course entity'si ile EnrolledCourseResponse DTO'su arasında dönüşüm yapan MapStruct mapper arayüzü.
 * Spring bileşeni olarak kullanılacak şekilde yapılandırılmıştır.
 */
@Mapper(componentModel = "spring")
public interface EnrolledCourseMapper {

    /**
     * Course entity'sini EnrolledCourseResponse DTO'suna dönüştürür.
     * Öğretmen bilgilerini de içerir.
     *
     * @param course Dönüştürülecek Course entity'si.
     * @return Dönüştürülmüş EnrolledCourseResponse DTO'su.
     */
    @Mapping(source = "teacher.id", target = "teacherId")
    @Mapping(source = "teacher.firstName", target = "teacherFirstName") // teacher.user.firstName yerine teacher.firstName
    @Mapping(source = "teacher.lastName", target = "teacherLastName")   // teacher.user.lastName yerine teacher.lastName
    EnrolledCourseResponse toEnrolledCourseResponse(Course course);

    /**
     * Course entity listesini EnrolledCourseResponse DTO listesine dönüştürür.
     *
     * @param courses Dönüştürülecek Course entity listesi.
     * @return Dönüştürülmüş EnrolledCourseResponse DTO listesi.
     */
    List<EnrolledCourseResponse> toEnrolledCourseResponseList(List<Course> courses);
}
