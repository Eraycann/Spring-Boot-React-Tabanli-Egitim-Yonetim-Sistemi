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
  Typography
} from '@mui/material';
import { 
  Quiz as QuizIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { apiService } from '../utils/apiService';

const ExamDeleteModal = ({ open, onClose, exam, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    setError('');
    onClose();
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError('');

      await apiService.delete(`/exams/${exam.id}`);
      
      onSuccess(exam.id);
      handleClose();
    } catch (err) {
      setError(err.message || 'Sınav silinirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (!exam) return null;

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
          <QuizIcon />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Sınav Sil
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
          {/* Warning Icon */}
          <Box className="flex justify-center">
            <Box className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center">
              <WarningIcon sx={{ fontSize: 40, color: '#dc2626' }} />
            </Box>
          </Box>

          {/* Confirmation Text */}
          <Box className="text-center">
            <Typography variant="h6" className="text-gray-800 font-semibold mb-2">
              Sınavı Silmek İstediğinizden Emin misiniz?
            </Typography>
            <Typography variant="body1" className="text-gray-600 mb-4">
              Bu işlem geri alınamaz ve sınav kalıcı olarak silinecektir.
            </Typography>
          </Box>

          {/* Exam Info */}
          <Box className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-xl border border-red-200">
            <Typography variant="body2" className="text-red-600 font-medium mb-1">
              Silinecek Sınav Bilgileri
            </Typography>
            <Typography variant="h6" className="text-gray-800 font-semibold">
              {exam.name}
            </Typography>
            <Box className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span>Sınav ID: #{exam.id}</span>
              <span>Kurs: {exam.courseName}</span>
              <span>Süre: {exam.durationInMinutes} dakika</span>
            </Box>
          </Box>

          {/* Warning Message */}
          <Box className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
            <Typography variant="body2" className="text-yellow-800 font-medium">
              ⚠️ Dikkat: Bu sınavla ilgili tüm veriler (sorular, cevaplar, sonuçlar) da silinecektir.
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
            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
              boxShadow: '0 6px 16px rgba(220, 38, 38, 0.4)',
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
          {loading ? 'Siliniyor...' : 'Sınavı Sil'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExamDeleteModal;
