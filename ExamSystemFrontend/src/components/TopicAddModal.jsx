import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Box,
  Typography
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { apiService } from '../utils/apiService';

const TopicAddModal = ({ open, onClose, courseId, courseName, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Konu adı gereklidir';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Konu adı en az 3 karakter olmalıdır';
    } else if (formData.name.trim().length > 100) {
      errors.name = 'Konu adı en fazla 100 karakter olabilir';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const response = await apiService.post('/topics', {
        name: formData.name.trim(),
        courseId: courseId
      });

      onSuccess(response);
      handleClose();
    } catch (err) {
      setError(err.message || 'Konu eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '' });
    setError('');
    setValidationErrors({});
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

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
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          borderRadius: '20px 20px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box className="flex items-center gap-2">
          <AddIcon />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Yeni Konu Ekle
          </Typography>
        </Box>
        <Button
          onClick={handleClose}
          sx={{ color: 'white', minWidth: 'auto' }}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" className="mb-4 rounded-xl">
            {error}
          </Alert>
        )}

        <Box className="space-y-4">
          {/* Course Info */}
          <Box className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
            <Typography variant="body2" className="text-blue-600 font-medium mb-1">
              Kurs Bilgisi
            </Typography>
            <Typography variant="h6" className="text-gray-800 font-semibold">
              {courseName}
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Kurs ID: #{courseId}
            </Typography>
          </Box>

          {/* Topic Name Input */}
          <TextField
            fullWidth
            label="Konu Adı"
            variant="outlined"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={!!validationErrors.name}
            helperText={validationErrors.name}
            placeholder="Örn: Programlama Temelleri"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#10b981'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#10b981',
                  borderWidth: '2px'
                }
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#10b981'
              }
            }}
            disabled={loading}
          />

          {/* Help Text */}
          <Box className="bg-gray-50 p-3 rounded-lg">
            <Typography variant="body2" className="text-gray-600">
              <strong>İpucu:</strong> Konu adı açıklayıcı ve anlaşılır olmalıdır. 
              Öğrenciler bu konu adını görecektir.
            </Typography>
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
              color: '#374151'
            }
          }}
        >
          İptal
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.name.trim()}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
          sx={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)'
            },
            '&:disabled': {
              background: '#d1d5db',
              boxShadow: 'none'
            }
          }}
        >
          {loading ? 'Ekleniyor...' : 'Konu Ekle'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TopicAddModal;
