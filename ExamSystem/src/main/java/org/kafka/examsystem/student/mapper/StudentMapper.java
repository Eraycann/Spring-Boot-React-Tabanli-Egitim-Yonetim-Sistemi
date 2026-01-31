package org.kafka.examsystem.student.mapper;

import org.kafka.examsystem.student.dto.StudentMinimalResponse;
import org.kafka.examsystem.student.model.Student;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface StudentMapper {


    /**
     * Student varlığını StudentMinimalResponse DTO'suna dönüştürür.
     *
     * @param student Dönüştürülecek öğrenci varlığı.
     * @return Dönüştürülmüş StudentMinimalResponse DTO'su.
     */
    @Mapping(target = "id", source = "id")
    @Mapping(target = "firstName", source = "firstName")
    @Mapping(target = "lastName", source = "lastName")
    StudentMinimalResponse toMinimalResponse(Student student);

    /**
     * Student varlıklarının listesini StudentMinimalResponse DTO'larının listesine dönüştürür.
     *
     * @param students Dönüştürülecek öğrenci varlıklarının listesi.
     * @return Dönüştürülmüş StudentMinimalResponse DTO'larının listesi.
     */
    List<StudentMinimalResponse> toMinimalResponseList(List<Student> students);
}
