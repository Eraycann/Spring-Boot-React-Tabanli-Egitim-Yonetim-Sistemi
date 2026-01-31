package org.kafka.examsystem.common.util;

import org.kafka.examsystem.user.model.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class AuthUtil {

    private AuthUtil() {
        // Bu sınıfın örneğinin oluşturulmasını engellemek için private constructor
    }

    public static User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal() instanceof String) {
            return null;
        }
        return (User) authentication.getPrincipal();
    }

    public static Long getCurrentUserId() {
        User user = getCurrentUser();
        return user != null ? user.getId() : null;
    }

    public static String getCurrentUserEmail() {
        User user = getCurrentUser();
        return user != null ? user.getEmail() : null;
    }

    public static String getCurrentUserRole() {
        User user = getCurrentUser();
        return user != null ? user.getRole().getName() : null;
    }

    public static boolean hasRole(String roleName) {
        User user = getCurrentUser();
        return user != null && user.getRole().getName().equals(roleName);
    }
}