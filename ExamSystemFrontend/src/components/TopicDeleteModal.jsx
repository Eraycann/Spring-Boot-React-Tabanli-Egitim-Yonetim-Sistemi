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
import { Delete as DeleteIcon, Warning as WarningIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { apiService } from '../utils/apiService';

const TopicDeleteModal = ({ open, onClose, topic, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    
    try {
      await apiService.delete(`/topics/${topic.id}`);
      onSuccess(topic.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Konu silinirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (!topic) return null;

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
          <DeleteIcon />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Konu Sil
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
            Bu işlem geri alınamaz! Konu kalıcı olarak silinecektir.
          </Alert>

          {/* Topic Info */}
          <Box className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-xl border border-red-200">
            <Typography variant="body2" className="text-red-600 font-medium mb-2">
              Silinecek Konu Bilgisi
            </Typography>
            <Typography variant="h6" className="text-gray-800 font-semibold mb-2">
              {topic.name}
            </Typography>
            <Box className="flex items-center gap-2">
              <Chip 
                label={`Konu ID: ${topic.id}`}
                size="small"
                sx={{
                  backgroundColor: '#fef2f2',
                  color: '#dc2626',
                  fontWeight: 600,
                  fontSize: '0.75rem'
                }}
              />
              <Chip 
                label={topic.courseName}
                size="small"
                sx={{
                  backgroundColor: '#f0f9ff',
                  color: '#0369a1',
                  fontWeight: 600,
                  fontSize: '0.75rem'
                }}
              />
            </Box>
          </Box>

          {/* Confirmation Text */}
          <Box className="bg-gray-50 p-4 rounded-lg">
            <Typography variant="body2" className="text-gray-700 mb-2">
              <strong>Onaylıyor musunuz?</strong>
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              "{topic.name}" konusu kalıcı olarak silinecektir. Bu işlem geri alınamaz ve 
              konuya bağlı tüm veriler de silinecektir.
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
              color: '#374151'
            }
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
              boxShadow: '0 6px 16px rgba(220, 38, 38, 0.4)'
            },
            '&:disabled': {
              background: '#d1d5db',
              boxShadow: 'none'
            }
          }}
        >
          {loading ? 'Siliniyor...' : 'Konuyu Sil'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TopicDeleteModal;
