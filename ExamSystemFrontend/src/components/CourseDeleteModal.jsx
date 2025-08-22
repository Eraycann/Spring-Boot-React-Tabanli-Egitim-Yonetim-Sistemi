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
  Chip
} from '@mui/material';
import { 
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { apiService } from '../utils/apiService';

const CourseDeleteModal = ({ open, onClose, course, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    
    try {
      await apiService.delete(`/courses/${course.id}`);
      onSuccess(course.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Kurs silinirken bir hata oluştu');
    } finally {
      setLoading(false);
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
        background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
        color: 'white',
        borderRadius: '20px 20px 0 0'
      }}>
        <Box className="flex items-center gap-2">
          <DeleteIcon />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Kurs Sil
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" className="mb-4 rounded-xl">
            {error}
          </Alert>
        )}
        
        <Box className="space-y-4">
          {/* Warning Alert */}
          <Alert 
            severity="warning" 
            icon={<WarningIcon />}
            className="rounded-xl"
            sx={{
              '& .MuiAlert-message': {
                fontWeight: 600
              }
            }}
          >
            <Typography variant="body1" className="font-semibold mb-1">
              Bu işlem geri alınamaz!
            </Typography>
            <Typography variant="body2">
              Kurs silindikten sonra tüm veriler kalıcı olarak silinecektir.
            </Typography>
          </Alert>
          
          {/* Course Info */}
          <Box className="bg-red-50 p-4 rounded-xl border border-red-200">
            <Typography variant="h6" className="text-red-800 font-bold mb-3">
              Silinecek Kurs Bilgileri:
            </Typography>
            
            <Box className="space-y-2">
              <Box className="flex items-center gap-2">
                <Typography variant="body1" className="text-red-700 font-semibold">
                  Kurs Adı:
                </Typography>
                <Typography variant="body1" className="text-red-600">
                  {course.name}
                </Typography>
              </Box>
              
              <Box className="flex items-center gap-2">
                <Typography variant="body1" className="text-red-700 font-semibold">
                  Kurs ID:
                </Typography>
                <Typography variant="body1" className="text-red-600">
                  #{course.id}
                </Typography>
              </Box>
              
              <Box className="flex items-center gap-2">
                <Typography variant="body1" className="text-red-700 font-semibold">
                  Sınıf Seviyesi:
                </Typography>
                <Chip 
                  label={getGradeLevelText(course.gradeLevel)}
                  size="small"
                  sx={{
                    backgroundColor: '#fef2f2',
                    color: '#dc2626',
                    fontWeight: 600,
                    border: '1px solid #fecaca'
                  }}
                />
              </Box>
              
              <Box className="flex items-center gap-2">
                <Typography variant="body1" className="text-red-700 font-semibold">
                  Öğretmen:
                </Typography>
                <Typography variant="body1" className="text-red-600">
                  {course.teacherFirstName} {course.teacherLastName}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          {/* Confirmation Text */}
          <Box className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <Typography variant="body2" className="text-gray-700 text-center">
              Bu kursu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={loading}
          startIcon={<CancelIcon />}
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
          onClick={handleDelete}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
          sx={{
            backgroundColor: '#dc2626',
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#b91c1c',
            },
            '&:disabled': {
              backgroundColor: '#9ca3af',
            },
          }}
        >
          {loading ? 'Siliniyor...' : 'Kursu Sil'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CourseDeleteModal;
