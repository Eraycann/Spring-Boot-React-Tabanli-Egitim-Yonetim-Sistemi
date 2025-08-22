/**
 * Backend'den gelen ErrorResponse yapısını işler
 * @param {Object} errorData - Backend'den gelen hata verisi
 * @returns {string} Kullanıcı dostu hata mesajı
 */
export const handleErrorResponse = (errorData) => {
  if (!errorData) {
    return 'Bilinmeyen bir hata oluştu';
  }

  // Tek mesajlı hata
  if (errorData.message && !errorData.errors) {
    return errorData.message;
  }

  // Validasyon hataları
  if (errorData.errors && Array.isArray(errorData.errors)) {
    return errorData.errors.join(', ');
  }

  // Code ve message varsa
  if (errorData.code && errorData.message) {
    return errorData.message;
  }

  // Sadece message varsa
  if (errorData.message) {
    return errorData.message;
  }

  return 'Bilinmeyen bir hata oluştu';
};

/**
 * HTTP response'u kontrol eder ve hata varsa işler
 * @param {Response} response - Fetch response objesi
 * @returns {Promise} Response data veya hata
 */
export const handleHttpResponse = async (response) => {
  if (!response.ok) {
    try {
      const responseText = await response.text();
      
      // Boş response kontrolü
      if (!responseText || responseText.trim() === '') {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (jsonError) {
        // JSON parse edilemiyorsa, response text'i direkt kullan
        if (responseText.includes('Veli ve Öğrenci başarıyla kaydedildi')) {
          // Başarı mesajı ise, bunu normal response olarak döndür
          return { message: responseText };
        }
        throw new Error(responseText);
      }

      const errorMessage = handleErrorResponse(errorData);
      throw new Error(errorMessage);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  // Başarılı response için JSON parse etmeye çalış
  try {
    const responseText = await response.text();
    
    // Boş response kontrolü
    if (!responseText || responseText.trim() === '') {
      return {};
    }

    // JSON parse etmeye çalış
    try {
      return JSON.parse(responseText);
    } catch (jsonError) {
      // JSON değilse, text olarak döndür
      return { message: responseText };
    }
  } catch (error) {
    throw new Error('Response işlenirken hata oluştu');
  }
};
