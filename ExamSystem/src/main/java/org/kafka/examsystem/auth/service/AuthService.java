package org.kafka.examsystem.auth.service;

import org.kafka.examsystem.auth.dto.AuthResponse;
import org.kafka.examsystem.auth.dto.LoginRequest;
import org.kafka.examsystem.auth.dto.RegisterParentRequest;
import org.kafka.examsystem.auth.dto.RegisterTeacherRequest;
import org.kafka.examsystem.auth.exception.domain.AuthDomainErrorCode;
import org.kafka.examsystem.auth.exception.domain.AuthDomainException;
import org.kafka.examsystem.auth.exception.validation.AuthValidationErrorCode;
import org.kafka.examsystem.auth.exception.validation.AuthValidationException;
import org.kafka.examsystem.auth.jwt.JwtService;
import org.kafka.examsystem.auth.token.RefreshToken;
import org.kafka.examsystem.parent.model.Parent;
import org.kafka.examsystem.parent.repository.ParentRepository;
import org.kafka.examsystem.student.model.Student;
import org.kafka.examsystem.student.repository.StudentRepository;
import org.kafka.examsystem.teacher.model.Teacher;
import org.kafka.examsystem.teacher.repository.TeacherRepository;
import org.kafka.examsystem.user.model.Role;
import org.kafka.examsystem.user.model.User;
import org.kafka.examsystem.user.repository.RoleRepository;
import org.kafka.examsystem.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Kimlik doğrulama ve kayıt işlemlerinin iş mantığını içeren servis katmanı.
 * Bu sınıf, kullanıcı girişi, veli/öğrenci kaydı ve öğretmen kaydı gibi işlemleri yönetir.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final ParentRepository parentRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final RefreshTokenService refreshTokenService;

    /**
     * Kullanıcı girişi işlemini gerçekleştirir ve başarılı olursa JWT token ile birlikte
     * kullanıcının e-postasını ve rolünü içeren bir AuthResponse DTO'su döndürür.
     *
     * @param loginRequest Kullanıcının giriş bilgileri (e-posta, şifre).
     * @return JWT token, refresh token, e-posta ve rolü içeren AuthResponse DTO'su.
     * @throws org.springframework.security.core.AuthenticationException Kimlik doğrulama başarısız olursa.
     */
    public AuthResponse loginUser(LoginRequest loginRequest) {
        // Kimlik doğrulama yöneticisini kullanarak kimlik doğrulama işlemi
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        // Başarılı kimlik doğrulamasından sonra güvenlik bağlamını güncelle
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // JWT token oluşturmak için UserDetails objesini al
        User userDetails = (User) authentication.getPrincipal();
        String accessToken = jwtService.generateToken(userDetails); // Erişim tokenı oluştur

        // Refresh token oluştur
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails);

        // AuthResponse DTO'sunu oluştur ve döndür
        return new AuthResponse(accessToken, refreshToken.getToken(), userDetails.getEmail(), userDetails.getRole().getName());
    }

    /**
     * Verilen refresh token ile yeni bir erişim tokenı oluşturur.
     *
     * @param requestRefreshToken Yenileme tokenı.
     * @return Yeni erişim tokenı ve mevcut yenileme tokenını içeren AuthResponse.
     * @throws AuthValidationException Token geçersizse veya süresi dolmuşsa.
     */
    public AuthResponse refreshAccessToken(String requestRefreshToken) {
        RefreshToken refreshToken = refreshTokenService.findByToken(requestRefreshToken)
                .orElseThrow(() -> new AuthValidationException(AuthValidationErrorCode.INVALID_REFRESH_TOKEN));

        if (refreshTokenService.verifyExpiration(refreshToken)) {
            throw new AuthValidationException(AuthValidationErrorCode.REFRESH_TOKEN_EXPIRED);
        }

        User user = refreshToken.getUser();
        String newAccessToken = jwtService.generateToken(user); // Kullanıcı için yeni erişim tokenı oluştur

        // Yeni oluşturulan erişim tokenı ve mevcut yenileme tokenı ile AuthResponse döndür
        return new AuthResponse(newAccessToken, refreshToken.getToken(), user.getEmail(), user.getRole().getName());
    }


    /**
     * Yeni bir veli ve ona bağlı bir öğrenci kaydı oluşturur.
     * Hem veli hem de öğrenci için ayrı User hesapları oluşturulur.
     * İşlem başarılı olursa, veritabanına kayıtları ekler.
     *
     * @param registerParentRequest Veli ve öğrenci kayıt bilgileri.
     * @throws AuthValidationException E-posta zaten kullanımda ise.
     * @throws AuthDomainException Rol bulunamadı ise.
     */
    @Transactional // Bu işlem atomik olmalı, hepsi başarılı olmalı ya da hiçbiri
    public void registerParentAndStudent(RegisterParentRequest registerParentRequest) {
        // Veli e-posta adresinin zaten kullanımda olup olmadığını kontrol et
        if (userRepository.existsByEmail(registerParentRequest.getEmail())) {
            throw new AuthValidationException(AuthValidationErrorCode.EMAIL_ALREADY_IN_USE);
        }
        // Öğrenci e-posta adresinin zaten kullanımda olup olmadığını kontrol et
        if (userRepository.existsByEmail(registerParentRequest.getStudentEmail())) {
            throw new AuthValidationException(AuthValidationErrorCode.EMAIL_ALREADY_IN_USE); // Öğrenci için de aynı kodu kullanabiliriz
        }

        // 1. Veli için Users kaydı oluştur
        User parentUser = new User();
        parentUser.setEmail(registerParentRequest.getEmail());
        parentUser.setPassword(passwordEncoder.encode(registerParentRequest.getPassword())); // Şifreyi kodla
        Role parentRole = roleRepository.findByName("ROLE_PARENT")
                .orElseThrow(() -> new AuthDomainException(AuthDomainErrorCode.ROLE_NOT_FOUND)); // Özel hata
        parentUser.setRole(parentRole);
        User savedParentUser = userRepository.save(parentUser);

        // 2. Parents kaydı oluştur ve bu Veli Users kaydına bağla
        Parent parent = new Parent();
        parent.setUser(savedParentUser);
        parent.setFirstName(registerParentRequest.getParentFirstName());
        parent.setLastName(registerParentRequest.getParentLastName());
        Parent savedParent = parentRepository.save(parent);

        // 3. Öğrenci için Users kaydı oluştur
        User studentUser = new User();
        studentUser.setEmail(registerParentRequest.getStudentEmail());
        studentUser.setPassword(passwordEncoder.encode(registerParentRequest.getStudentPassword())); // Şifreyi kodla
        Role studentRole = roleRepository.findByName("ROLE_STUDENT") // ROLE_STUDENT rolünü kullan
                .orElseThrow(() -> new AuthDomainException(AuthDomainErrorCode.ROLE_NOT_FOUND)); // Özel hata
        studentUser.setRole(studentRole);
        User savedStudentUser = userRepository.save(studentUser);

        // 4. Students kaydı oluştur (çocuk için) ve velisine ve kendi Users kaydına bağla
        Student student = new Student();
        student.setParent(savedParent); // Öğrencinin velisi
        student.setUser(savedStudentUser); // Öğrencinin kendi kullanıcı hesabı
        student.setFirstName(registerParentRequest.getStudentFirstName());
        student.setLastName(registerParentRequest.getStudentLastName());
        student.setGradeLevel(registerParentRequest.getGradeLevel());
        studentRepository.save(student);
    }

    /**
     * Admin tarafından yeni bir öğretmen kaydı oluşturur.
     *
     * @param registerTeacherRequest Öğretmen kayıt bilgileri.
     * @throws AuthValidationException E-posta zaten kullanımda ise.
     * @throws AuthDomainException Rol bulunamadı ise.
     */
    @Transactional // atomic
    public void registerTeacher(RegisterTeacherRequest registerTeacherRequest) {
        if (userRepository.existsByEmail(registerTeacherRequest.getEmail())) {
            throw new AuthValidationException(AuthValidationErrorCode.EMAIL_ALREADY_IN_USE);
        }

        // 1. Öğretmen için Users kaydı oluştur
        User user = new User();
        user.setEmail(registerTeacherRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerTeacherRequest.getPassword())); // Şifreyi kodla
        Role teacherRole = roleRepository.findByName("ROLE_TEACHER")
                .orElseThrow(() -> new AuthDomainException(AuthDomainErrorCode.ROLE_NOT_FOUND)); // Özel hata
        user.setRole(teacherRole);
        User savedUser = userRepository.save(user);

        // 2. Teachers kaydı oluştur ve bu Users kaydına bağla
        Teacher teacher = new Teacher();
        teacher.setUser(savedUser);
        teacher.setFirstName(registerTeacherRequest.getFirstName());
        teacher.setLastName(registerTeacherRequest.getLastName());
        teacher.setBranch(registerTeacherRequest.getBranch());
        teacherRepository.save(teacher);
    }
}
