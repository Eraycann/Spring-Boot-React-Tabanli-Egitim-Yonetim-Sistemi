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
  Avatar,
  Chip
} from '@mui/material';
import { 
  PersonRemove as PersonRemoveIcon, 
  Warning as WarningIcon, 
  Cancel as CancelIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { apiService } from '../utils/apiService';

const StudentRemoveModal = ({ open, onClose, student, courseId, courseName, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRemove = async () => {
    setLoading(true);
    setError('');
    
    try {
      await apiService.delete(`/course-students/${courseId}/students/${student.id}`);
      onSuccess(student.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Öğrenci çıkarılırken bir hata oluştu');
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

  const getGradeLevelColor = (gradeLevel) => {
    switch (gradeLevel) {
      case 9: return { bg: '#fef3c7', color: '#92400e', border: '#f59e0b' };
      case 10: return { bg: '#dbeafe', color: '#1e40af', border: '#3b82f6' };
      case 11: return { bg: '#dcfce7', color: '#166534', border: '#22c55e' };
      case 12: return { bg: '#fce7f3', color: '#be185d', border: '#ec4899' };
      default: return { bg: '#f3f4f6', color: '#374151', border: '#6b7280' };
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  if (!student) return null;

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
          background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
          color: 'white',
          borderRadius: '20px 20px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box className="flex items-center gap-2">
          <PersonRemoveIcon />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Öğrenci Çıkar
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
              backgroundColor: '#fef3c7',
              border: '1px solid #f59e0b',
              '& .MuiAlert-icon': { color: '#92400e' },
              '& .MuiAlert-message': { color: '#92400e' }
            }}
          >
            <Typography variant="body1" className="font-semibold mb-1">
              Dikkat!
            </Typography>
            <Typography variant="body2">
              Bu işlem geri alınamaz. Öğrenci kursa tekrar eklenebilir ancak mevcut kayıtlar silinecektir.
            </Typography>
          </Alert>

          {/* Course Info */}
          <Box className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-xl border border-red-200">
            <Typography variant="body2" className="text-red-600 font-medium mb-1">
              Kurs Bilgisi
            </Typography>
            <Typography variant="h6" className="text-gray-800 font-semibold">
              {courseName}
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Kurs ID: #{courseId}
            </Typography>
          </Box>

          {/* Student Info */}
          <Box className="bg-white p-4 rounded-xl border border-gray-200">
            <Typography variant="body2" className="text-gray-600 font-medium mb-3">
              Çıkarılacak Öğrenci
            </Typography>
            
            <Box className="flex items-center gap-4">
              <Avatar
                sx={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  width: 64,
                  height: 64,
                  fontSize: '1.5rem',
                  fontWeight: 600
                }}
              >
                {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
              </Avatar>
              
              <Box className="flex-1">
                <Typography variant="h5" className="font-bold text-gray-800 mb-2">
                  {student.firstName} {student.lastName}
                </Typography>
                
                <Box className="flex items-center gap-2">
                  <Chip 
                    label={`ID: ${student.id}`}
                    size="small"
                    sx={{
                      backgroundColor: '#f0f9ff',
                      color: '#0369a1',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}
                  />
                  {student.gradeLevel && (
                    <Chip 
                      label={getGradeLevelText(student.gradeLevel)}
                      size="small"
                      sx={{
                        backgroundColor: getGradeLevelColor(student.gradeLevel).bg,
                        color: getGradeLevelColor(student.gradeLevel).color,
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}
                    />
                  )}
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Confirmation Text */}
          <Box className="bg-red-50 p-4 rounded-xl border border-red-200">
            <Typography variant="body1" className="text-red-700 font-medium text-center">
              "{student.firstName} {student.lastName}" isimli öğrenciyi bu kurstan çıkarmak istediğinizden emin misiniz?
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          startIcon={<CancelIcon />}
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
          onClick={handleRemove}
          variant="contained"
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <CheckIcon />}
          disabled={loading}
          sx={{
            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
              boxShadow: '0 6px 16px rgba(220, 38, 38, 0.4)'
            },
            '&:disabled': {
              background: '#9ca3af',
              boxShadow: 'none'
            }
          }}
        >
          {loading ? 'Çıkarılıyor...' : 'Öğrenciyi Çıkar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentRemoveModal;
