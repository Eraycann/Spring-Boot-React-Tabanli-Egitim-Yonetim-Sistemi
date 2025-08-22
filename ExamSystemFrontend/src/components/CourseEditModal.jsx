import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Box,
  Typography
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { apiService } from '../utils/apiService';

const CourseEditModal = ({ open, onClose, course, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    gradeLevel: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name || '',
        gradeLevel: course.gradeLevel || ''
      });
      setError('');
      setValidationErrors({});
    }
  }, [course]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Kurs adı zorunludur';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Kurs adı en az 2 karakter olmalıdır';
    } else if (formData.name.trim().length > 100) {
      errors.name = 'Kurs adı en fazla 100 karakter olabilir';
    }
    
    if (!formData.gradeLevel) {
      errors.gradeLevel = 'Sınıf seviyesi zorunludur';
    } else if (![9, 10, 11, 12].includes(Number(formData.gradeLevel))) {
      errors.gradeLevel = 'Geçerli bir sınıf seviyesi seçin';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await apiService.put(`/courses/${course.id}`, {
        name: formData.name.trim(),
        gradeLevel: Number(formData.gradeLevel)
      });
      
      onSuccess(response);
      onClose();
    } catch (err) {
      setError(err.message || 'Kurs güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const getGradeLevelText = (gradeLevel) => {
    switch (gradeLevel) {
      case 9: return '9. Sınıf';
      case 10: return '10. Sınıf';
      case 11: return '11. Sınıf';
      case 12: return '12. Sınıf';
      default: return `${gradeLevel}. Sınıf`;
    }
  };

  if (!course) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1,
        background: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)',
        color: 'white',
        borderRadius: '20px 20px 0 0'
      }}>
        <Box className="flex items-center gap-2">
          <EditIcon />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Kurs Düzenle
          </Typography>
        </Box>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3 }}>
          {error && (
            <Alert severity="error" className="mb-4 rounded-xl">
              {error}
            </Alert>
          )}
          
          <Box className="space-y-4">
            <TextField
              fullWidth
              label="Kurs Adı"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={!!validationErrors.name}
              helperText={validationErrors.name}
              placeholder="Örn: MATEMATİK-101"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  '&:hover fieldset': {
                    borderColor: '#3b82f6',
                  },
                }
              }}
            />
            
            <FormControl fullWidth error={!!validationErrors.gradeLevel}>
              <InputLabel>Sınıf Seviyesi</InputLabel>
              <Select
                value={formData.gradeLevel}
                onChange={(e) => handleInputChange('gradeLevel', e.target.value)}
                label="Sınıf Seviyesi"
                sx={{
                  borderRadius: '12px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    '&:hover': {
                      borderColor: '#3b82f6',
                    },
                  },
                }}
              >
                <MenuItem value={9}>9. Sınıf</MenuItem>
                <MenuItem value={10}>10. Sınıf</MenuItem>
                <MenuItem value={11}>11. Sınıf</MenuItem>
                <MenuItem value={12}>12. Sınıf</MenuItem>
              </Select>
              {validationErrors.gradeLevel && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {validationErrors.gradeLevel}
                </Typography>
              )}
            </FormControl>
            
            <Box className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <Typography variant="body2" className="text-blue-800 font-medium mb-2">
                Kurs Bilgileri:
              </Typography>
              <Typography variant="body2" className="text-blue-700">
                • Kurs ID: #{course.id}
              </Typography>
              <Typography variant="body2" className="text-blue-700">
                • Öğretmen: {course.teacherFirstName} {course.teacherLastName}
              </Typography>
              <Typography variant="body2" className="text-blue-700">
                • Mevcut Sınıf: {getGradeLevelText(course.gradeLevel)}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            disabled={loading}
            sx={{
              borderColor: '#6b7280',
              color: '#6b7280',
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                borderColor: '#374151',
                color: '#374151',
              },
            }}
          >
            İptal
          </Button>
          
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <EditIcon />}
            sx={{
              backgroundColor: '#3b82f6',
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#2563eb',
              },
              '&:disabled': {
                backgroundColor: '#9ca3af',
              },
            }}
          >
            {loading ? 'Güncelleniyor...' : 'Güncelle'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CourseEditModal;
