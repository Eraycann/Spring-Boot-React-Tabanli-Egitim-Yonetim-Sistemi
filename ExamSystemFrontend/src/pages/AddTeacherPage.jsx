import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { apiService } from '../utils/apiService';

const AddTeacherPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    branch: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiService.post('/auth/admin/teachers', formData);
      setSuccess('Öğretmen başarıyla eklendi!');
      
      // Form'u temizle
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        branch: ''
      });
      
      // 3 saniye sonra mesajı kaldır
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Öğretmen eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="min-h-screen bg-gray-50 py-8 px-4">
      <Box className="max-w-2xl mx-auto">
        <Paper 
          elevation={0}
          className="p-8 rounded-lg border border-gray-200"
          sx={{ backgroundColor: '#ffffff' }}
        >
          <Box className="text-center mb-8">
            <Typography variant="h4" className="font-bold text-gray-800 mb-2">
              Öğretmen Ekle
            </Typography>
            <Typography variant="body1" className="text-gray-600">
              Yeni öğretmen hesabı oluşturun
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" className="mb-6">
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" className="mb-6">
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} className="space-y-4">
            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                fullWidth
                label="Ad"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                variant="outlined"
                size="small"
              />
              <TextField
                fullWidth
                label="Soyad"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                variant="outlined"
                size="small"
              />
            </Box>

            <TextField
              fullWidth
              label="E-posta"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              variant="outlined"
              size="small"
            />

            <TextField
              fullWidth
              label="Şifre"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              variant="outlined"
              size="small"
            />

            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Branş</InputLabel>
              <Select
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                label="Branş"
                required
              >
                <MenuItem value="MATEMATİK">Matematik</MenuItem>
                <MenuItem value="FİZİK">Fizik</MenuItem>
                <MenuItem value="KİMYA">Kimya</MenuItem>
                <MenuItem value="BİYOLOJİ">Biyoloji</MenuItem>
                <MenuItem value="TÜRKÇE">Türkçe</MenuItem>
                <MenuItem value="TARİH">Tarih</MenuItem>
                <MenuItem value="COĞRAFYA">Coğrafya</MenuItem>
                <MenuItem value="FELSEFE">Felsefe</MenuItem>
                <MenuItem value="İNGİLİZCE">İngilizce</MenuItem>
                <MenuItem value="ALMANCA">Almanca</MenuItem>
                <MenuItem value="FRANSIZCA">Fransızca</MenuItem>
                <MenuItem value="BİLGİSAYAR">Bilgisayar</MenuItem>
                <MenuItem value="BEDEN EĞİTİMİ">Beden Eğitimi</MenuItem>
                <MenuItem value="MÜZİK">Müzik</MenuItem>
                <MenuItem value="RESİM">Resim</MenuItem>
                <MenuItem value="DİN KÜLTÜRÜ">Din Kültürü</MenuItem>
                <MenuItem value="REHBERLİK">Rehberlik</MenuItem>
              </Select>
            </FormControl>

            <Box className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                className="h-12"
                sx={{
                  backgroundColor: '#3b82f6',
                  '&:hover': {
                    backgroundColor: '#2563eb',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Öğretmen Ekle'
                )}
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/')}
                className="h-12"
                sx={{
                  borderColor: '#6b7280',
                  color: '#374151',
                  '&:hover': {
                    borderColor: '#3b82f6',
                    color: '#3b82f6',
                  },
                }}
              >
                Ana Sayfaya Dön
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default AddTeacherPage;
