import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { 
  Quiz as QuizIcon,
  Close as CloseIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { apiService } from '../utils/apiService';

const ExamAddModal = ({ open, onClose, courseId, courseName, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    durationInMinutes: 45
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    setFormData({
      name: '',
      durationInMinutes: 45
    });
    setError('');
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Sınav adı gereklidir');
      return;
    }

    if (formData.durationInMinutes < 1) {
      setError('Süre en az 1 dakika olmalıdır');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const examData = {
        name: formData.name.trim(),
        durationInMinutes: formData.durationInMinutes,
        courseId: courseId
      };

      const response = await apiService.post('/exams', examData);
      
      onSuccess(response);
      handleClose();
    } catch (err) {
      setError(err.message || 'Sınav eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const durationOptions = [
    { value: 30, label: '30 dakika' },
    { value: 45, label: '45 dakika' },
    { value: 60, label: '1 saat' },
    { value: 90, label: '1.5 saat' },
    { value: 120, label: '2 saat' },
    { value: 150, label: '2.5 saat' },
    { value: 180, label: '3 saat' }
  ];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <DialogTitle
        sx={{
          pb: 1,
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: 'white',
          borderRadius: '20px 20px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box className="flex items-center gap-2">
          <QuizIcon />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Sınav Ekle
          </Typography>
        </Box>
        <Button
          onClick={handleClose}
          sx={{ color: 'white', minWidth: 'auto' }}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3 }}>
          {error && (
            <Alert severity="error" className="mb-4 rounded-xl">
              {error}
            </Alert>
          )}

          <Box className="space-y-4">
            {/* Course Info */}
            <Box className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-200">
              <Typography variant="body2" className="text-orange-600 font-medium mb-1">
                Kurs Bilgisi
              </Typography>
              <Typography variant="h6" className="text-gray-800 font-semibold">
                {courseName}
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Kurs ID: #{courseId}
              </Typography>
            </Box>

            {/* Form Fields */}
            <Box className="space-y-4">
              <TextField
                fullWidth
                label="Sınav Adı"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Örn: 2025 1. Dönem Final Sınav"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#f59e0b'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#d97706'
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#d97706'
                  }
                }}
                required
              />

              <FormControl fullWidth>
                <InputLabel>Sınav Süresi</InputLabel>
                <Select
                  value={formData.durationInMinutes}
                  onChange={(e) => handleInputChange('durationInMinutes', e.target.value)}
                  label="Sınav Süresi"
                  sx={{
                    borderRadius: '12px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      '&:hover': {
                        borderColor: '#f59e0b'
                      }
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#d97706'
                    }
                  }}
                >
                  {durationOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Preview */}
            <Box className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <Typography variant="body2" className="text-gray-600 font-medium mb-2">
                Önizleme
              </Typography>
              <Box className="space-y-2">
                <Typography variant="body1" className="text-gray-800">
                  <strong>Sınav Adı:</strong> {formData.name || 'Belirtilmemiş'}
                </Typography>
                <Typography variant="body1" className="text-gray-800">
                  <strong>Süre:</strong> {durationOptions.find(opt => opt.value === formData.durationInMinutes)?.label || '45 dakika'}
                </Typography>
                <Typography variant="body1" className="text-gray-800">
                  <strong>Kurs:</strong> {courseName}
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={handleClose}
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
            disabled={loading || !formData.name.trim()}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
            sx={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                boxShadow: '0 6px 16px rgba(245, 158, 11, 0.4)',
                transform: 'translateY(-1px)'
              },
              '&:disabled': {
                background: '#d1d5db',
                color: '#6b7280',
                transform: 'none',
                boxShadow: 'none'
              }
            }}
          >
            {loading ? 'Ekleniyor...' : 'Sınav Ekle'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ExamAddModal;
