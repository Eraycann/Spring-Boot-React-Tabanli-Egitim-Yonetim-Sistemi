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
  IconButton
} from '@mui/material';
import {
  QuestionAnswer as QuestionIcon,
  Close as CloseIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { apiService } from '../utils/apiService';

const ExamQuestionDeleteModal = ({ open, onClose, question, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!question?.id) {
      setError('Soru ID bulunamadı');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await apiService.delete(`/exam-questions/${question.id}`);
      
      onSuccess(question.id);
      
    } catch (err) {
      console.error('Soru silinirken hata:', err);
      setError(err.message || 'Soru silinirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
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
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          borderRadius: '20px 20px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box className="flex items-center gap-2">
          <QuestionIcon />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Soru Sil
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" className="mb-4 rounded-xl">
            {error}
          </Alert>
        )}

        <Box className="text-center py-4">
          <Box className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <WarningIcon sx={{ fontSize: 32, color: '#ef4444' }} />
          </Box>
          
          <Typography variant="h6" className="font-semibold text-gray-900 mb-3">
            Bu soruyu silmek istediğinizden emin misiniz?
          </Typography>
          
          <Typography variant="body1" className="text-gray-600 mb-4">
            Bu işlem geri alınamaz. Soru kalıcı olarak silinecektir.
          </Typography>

          {question && (
            <Box className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <Typography variant="body2" className="text-gray-600 font-medium mb-2">
                Silinecek Soru:
              </Typography>
              <Typography variant="body1" className="font-semibold text-gray-900 line-clamp-2">
                {question.questionText}
              </Typography>
              <Box className="flex items-center gap-2 mt-2">
                <Typography variant="body2" className="text-gray-500">
                  Konu: {question.topicName}
                </Typography>
                <Typography variant="body2" className="text-gray-500">
                  • Puan: {question.score}
                </Typography>
              </Box>
            </Box>
          )}
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
          startIcon={loading ? <CircularProgress size={20} /> : null}
          sx={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            },
          }}
        >
          {loading ? 'Siliniyor...' : 'Evet, Sil'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExamQuestionDeleteModal;
