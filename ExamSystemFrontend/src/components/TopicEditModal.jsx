import { useState, useEffect } from 'react';
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
import { Edit as EditIcon, Close as CloseIcon } from '@mui/icons-material';
import { apiService } from '../utils/apiService';

const TopicEditModal = ({ open, onClose, topic, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (topic) {
      setFormData({
        name: topic.name || ''
      });
    }
  }, [topic]);

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
      const response = await apiService.put(`/topics/${topic.id}`, {
        name: formData.name.trim()
      });

      onSuccess(response);
      handleClose();
    } catch (err) {
      setError(err.message || 'Konu güncellenirken bir hata oluştu');
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

  if (!topic) return null;

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
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          color: 'white',
          borderRadius: '20px 20px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box className="flex items-center gap-2">
          <EditIcon />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Konu Düzenle
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
          {/* Topic Info */}
          <Box className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
            <Typography variant="body2" className="text-blue-600 font-medium mb-1">
              Konu Bilgisi
            </Typography>
            <Typography variant="h6" className="text-gray-800 font-semibold">
              {topic.name}
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Konu ID: #{topic.id} • Kurs: {topic.courseName}
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
            placeholder="Örn: Programlama Temelleri v2"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3b82f6'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3b82f6',
                  borderWidth: '2px'
                }
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#3b82f6'
              }
            }}
            disabled={loading}
          />

          {/* Help Text */}
          <Box className="bg-gray-50 p-3 rounded-lg">
            <Typography variant="body2" className="text-gray-600">
              <strong>İpucu:</strong> Konu adını güncelleyerek daha açıklayıcı hale getirebilirsiniz. 
              Bu değişiklik öğrenciler tarafından da görülecektir.
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
          disabled={loading || !formData.name.trim() || formData.name.trim() === topic.name}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <EditIcon />}
          sx={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
              boxShadow: '0 6px 16px rgba(59, 130, 246, 0.4)'
            },
            '&:disabled': {
              background: '#d1d5db',
              boxShadow: 'none'
            }
          }}
        >
          {loading ? 'Güncelleniyor...' : 'Konuyu Güncelle'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TopicEditModal;
