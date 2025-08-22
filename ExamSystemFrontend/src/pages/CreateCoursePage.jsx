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

const CreateCoursePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    gradeLevel: ''
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
      const response = await apiService.post('/courses', formData);
      setSuccess('Kurs başarıyla oluşturuldu!');
      
      // Form'u temizle
      setFormData({
        name: '',
        gradeLevel: ''
      });
      
      // 3 saniye sonra mesajı kaldır
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Kurs oluşturulurken bir hata oluştu');
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
              Kurs Oluştur
            </Typography>
            <Typography variant="body1" className="text-gray-600">
              Yeni kurs hesabı oluşturun
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
            <TextField
              fullWidth
              label="Kurs Adı"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              variant="outlined"
              size="small"
              placeholder="Örnek: MATEMATİK-101"
            />

            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Sınıf Seviyesi</InputLabel>
              <Select
                name="gradeLevel"
                value={formData.gradeLevel}
                onChange={handleChange}
                label="Sınıf Seviyesi"
                required
              >
                <MenuItem value={9}>9. Sınıf</MenuItem>
                <MenuItem value={10}>10. Sınıf</MenuItem>
                <MenuItem value={11}>11. Sınıf</MenuItem>
                <MenuItem value={12}>12. Sınıf</MenuItem>
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
                  'Kurs Oluştur'
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

export default CreateCoursePage;
