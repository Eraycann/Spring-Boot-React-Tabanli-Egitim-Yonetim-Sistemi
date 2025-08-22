import { apiService } from '../utils/apiService';

class AuthService {
  async login(credentials) {
    try {
      const data = await apiService.post('/auth/login', credentials);
      
      // Token'ları localStorage'a kaydet
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('userEmail', data.email);
      localStorage.setItem('userRole', data.role);
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  initiateGoogleLogin() {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }

  async handleOAuth2Callback() {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    
    if (error) {
      switch (error) {
        case 'email_not_found':
          throw new Error('Bu e-posta adresi sistemde bulunamadı. Lütfen kayıt olun.');
        case 'user_not_registered':
          throw new Error('Bu kullanıcı henüz kayıt olmamış. Lütfen önce kayıt olun.');
        default:
          throw new Error('OAuth2 girişi sırasında bir hata oluştu.');
      }
    }

    const accessToken = urlParams.get('accessToken');
    const refreshToken = urlParams.get('refreshToken');
    const email = urlParams.get('email');
    const role = urlParams.get('role');

    if (accessToken && refreshToken && email && role) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userRole', role);
      
      // URL'den parametreleri temizle
      window.history.replaceState({}, document.title, window.location.pathname);
      
      return { accessToken, refreshToken, email, role };
    }
    
    throw new Error('OAuth2 callback parametreleri eksik');
  }

  logout() {
    // Sadece localStorage'ı temizle, redirect yapma
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
  }

  getAccessToken() {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  }

  getUserInfo() {
    const email = localStorage.getItem('userEmail');
    const role = localStorage.getItem('userRole');
    
    if (email && role) {
      return { email, role };
    }
    
    return null;
  }

  // Token'ların varlığını kontrol et (backend çağrısı yapmadan)
  validateTokens() {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    
    // Sadece token'ların varlığını kontrol et
    return !!(accessToken && refreshToken);
  }

  // Token yenileme fonksiyonu (apiService'den bağımsız)
  async refreshToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('Refresh token bulunamadı');
    }

    try {
      const response = await fetch('http://localhost:8080/api/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken })
      });

      if (response.status === 403) {
        // Refresh token geçersiz
        this.logout();
        window.location.href = '/login';
        throw new Error('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
      }

      if (!response.ok) {
        throw new Error(`Token yenileme hatası: ${response.status}`);
      }

      const data = await response.json();
      
      // Yeni tokenları localStorage'a kaydet
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('userEmail', data.email);
      localStorage.setItem('userRole', data.role);
      
      return data.accessToken;
    } catch (error) {
      console.error('Token yenileme hatası:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
