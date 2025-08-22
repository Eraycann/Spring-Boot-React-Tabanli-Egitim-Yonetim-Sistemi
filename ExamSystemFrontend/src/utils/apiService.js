import { handleHttpResponse } from './errorHandler';

const API_BASE_URL = 'http://localhost:8080/api';

// Token yenileme fonksiyonu
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('Refresh token bulunamadı');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken })
    });

    if (response.status === 403) {
      // Refresh token geçersiz, kullanıcıyı login sayfasına yönlendir
      localStorage.clear();
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
    // Sadece refresh token hatası durumunda localStorage'ı temizle
    if (error.message.includes('Oturum süresi doldu')) {
      localStorage.clear();
      window.location.href = '/login';
    }
    throw error;
  }
};

// İstek yapma fonksiyonu (token yenileme ile)
const makeRequest = async (url, options, retryCount = 0) => {
  const accessToken = localStorage.getItem('accessToken');
  
  const requestOptions = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, requestOptions);
    
    // 401 hatası alındıysa ve henüz retry yapılmadıysa token yenile
    if (response.status === 401 && retryCount === 0) {
      try {
        const newAccessToken = await refreshAccessToken();
        
        // Yeni token ile isteği tekrarla
        const retryOptions = {
          ...requestOptions,
          headers: {
            ...requestOptions.headers,
            'Authorization': `Bearer ${newAccessToken}`,
          },
        };
        
        return await makeRequest(url, retryOptions, retryCount + 1);
      } catch (refreshError) {
        // Token yenileme başarısız, kullanıcıyı login sayfasına yönlendir
        if (refreshError.message.includes('Oturum süresi doldu')) {
          localStorage.clear();
          window.location.href = '/login';
        }
        throw refreshError;
      }
    }
    
    // 403 hatası alındıysa kullanıcıyı login sayfasına yönlendir
    if (response.status === 403) {
      localStorage.clear();
      window.location.href = '/login';
      throw new Error('Yetkisiz erişim. Lütfen tekrar giriş yapın.');
    }
    
    return response;
  } catch (error) {
    // Network hatası veya diğer hatalar için localStorage'ı temizleme
    if (error.message.includes('Token yenileme hatası') || 
        error.message.includes('Yetkisiz erişim') ||
        error.message.includes('Oturum süresi doldu')) {
      throw error;
    }
    
    // Network hatası veya diğer hatalar
    throw new Error(`İstek hatası: ${error.message}`);
  }
};

export const apiService = {
  async get(endpoint, options = {}) {
    const response = await makeRequest(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      ...options,
    });
    return handleHttpResponse(response);
  },

  async post(endpoint, data, options = {}) {
    const response = await makeRequest(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
    return handleHttpResponse(response);
  },

  async put(endpoint, data, options = {}) {
    const response = await makeRequest(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
    return handleHttpResponse(response);
  },

  async delete(endpoint, options = {}) {
    const response = await makeRequest(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      ...options,
    });
    return handleHttpResponse(response);
  },
};
