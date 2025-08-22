import { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // İlk yüklemede auth durumunu kontrol et
  useEffect(() => {
    const initializeAuth = () => {
      try {
        setLoading(true);
        
        // Token'ların varlığını kontrol et
        const hasValidTokens = authService.validateTokens();
        
        if (hasValidTokens) {
          const userInfo = authService.getUserInfo();
          if (userInfo) {
            setIsAuthenticated(true);
            setUser(userInfo);
          } else {
            // Token var ama kullanıcı bilgisi yok, logout yap
            handleLogout();
          }
        } else {
          // Token yok, logout yap
          handleLogout();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Sadece auth ile ilgili hatalarda logout yap
        if (error.message.includes('Oturum süresi doldu') || 
            error.message.includes('Yetkisiz erişim')) {
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleLogout = () => {
    // Sadece localStorage'ı temizle, redirect yapma
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    
    // State'i güncelle
    setIsAuthenticated(false);
    setUser(null);
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      setIsAuthenticated(true);
      setUser(authService.getUserInfo());
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = () => {
    authService.initiateGoogleLogin();
  };

  const logout = () => {
    handleLogout();
    // Sadece logout butonuna tıklandığında redirect yap
    window.location.href = '/login';
  };

  const value = {
    isAuthenticated,
    setIsAuthenticated,
    user,
    setUser,
    loading,
    setLoading,
    login,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
