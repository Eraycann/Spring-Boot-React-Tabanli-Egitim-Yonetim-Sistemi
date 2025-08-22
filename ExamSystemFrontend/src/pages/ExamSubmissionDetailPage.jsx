import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  Stack,
  Divider
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  ArrowBack as ArrowBackIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Grade as GradeIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon
} from '@mui/icons-material';
import { apiService } from '../utils/apiService';

const ExamSubmissionDetailPage = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (submissionId) {
      fetchSubmissionDetails();
    }
  }, [submissionId]);

  const fetchSubmissionDetails = async () => {
    if (!submissionId) {
      setError('Sınav girişi ID bulunamadı');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await apiService.get(`/exam-submissions/${submissionId}`);
      setSubmission(response);
    } catch (err) {
      setError(err.message || 'Sınav girişi detayları yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/exam-submissions');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Henüz tamamlanmadı';
    return new Date(dateString).toLocaleString('tr-TR');
  };

  const getStatusChip = (submittedAt) => {
    if (submittedAt) {
      return (
        <Chip
          icon={<CheckCircleIcon />}
          label="Tamamlandı"
          size="large"
          sx={{
            backgroundColor: '#dcfce7',
            color: '#166534',
            fontWeight: 700,
            fontSize: '0.875rem',
            padding: '8px 16px',
            height: '40px',
            '& .MuiChip-icon': {
              color: '#166534',
              fontSize: '20px'
            },
            '& .MuiChip-label': {
              fontSize: '0.875rem',
              fontWeight: 700,
              letterSpacing: '0.5px'
            }
          }}
        />
      );
    }
    return (
      <Chip
        icon={<PendingIcon />}
        label="Devam Ediyor"
        size="large"
        sx={{
          backgroundColor: '#fef3c7',
          color: '#92400e',
          fontWeight: 700,
          fontSize: '0.875rem',
          padding: '8px 16px',
          height: '40px',
          '& .MuiChip-icon': {
            color: '#92400e',
            fontSize: '20px'
          },
          '& .MuiChip-label': {
            fontSize: '0.875rem',
            fontWeight: 700,
            letterSpacing: '0.5px'
          }
        }}
      />
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box className="flex justify-center items-center h-96">
          <CircularProgress size={48} sx={{ color: '#6366f1' }} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error" className="rounded-xl mb-6">
          {error}
        </Alert>
        <Button
          variant="outlined"
          onClick={handleBack}
          startIcon={<ArrowBackIcon />}
          sx={{ borderRadius: '12px' }}
        >
          Geri Dön
        </Button>
      </Container>
    );
  }

  if (!submission) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="warning" className="rounded-xl mb-6">
          Sınav girişi bulunamadı
        </Alert>
        <Button
          variant="outlined"
          onClick={handleBack}
          startIcon={<ArrowBackIcon />}
          sx={{ borderRadius: '12px' }}
        >
          Geri Dön
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Header Section */}
      <Box className="mb-8">
        <Button
          variant="text"
          onClick={handleBack}
          startIcon={<ArrowBackIcon />}
          sx={{ 
            mb: 4, 
            color: '#6b7280',
            borderRadius: '12px',
            '&:hover': { 
              backgroundColor: '#f3f4f6',
              color: '#374151'
            }
          }}
        >
          Sınav Girişlerine Dön
        </Button>

        {/* Submission Header Card */}
        <Card elevation={0} sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '24px',
          color: 'white',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <Box className="absolute inset-0 bg-black bg-opacity-10" />
          <CardContent sx={{ p: 6, position: 'relative', zIndex: 1 }}>
            <Box className="flex items-start justify-between">
              <Box className="flex items-center gap-4">
                <Box className="bg-white bg-opacity-20 w-16 h-16 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <AssignmentIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h3" className="font-bold mb-3">
                    {submission.examName}
                  </Typography>
                  <Box className="flex items-center gap-3">
                    {getStatusChip(submission.submittedAt)}
                    <Typography variant="body1" className="opacity-90 font-medium">
                      {submission.submittedAt ? 'Sınav tamamlandı' : 'Sınav devam ediyor'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box className="text-right">
                <Typography variant="h6" className="font-semibold opacity-90 mb-1">
                  Giriş ID
                </Typography>
                <Typography variant="h4" className="font-bold">
                  #{submission.id}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Content Grid */}
      <Grid container spacing={4}>
        {/* Submission Details */}
        <Grid item xs={12} lg={8}>
          <Stack spacing={4}>
            {/* Submission Info Card */}
            <Card elevation={0} sx={{ 
              borderRadius: '20px', 
              border: '1px solid #e5e7eb',
              backgroundColor: '#ffffff'
            }}>
              <CardContent sx={{ p: 5 }}>
                <Box className="flex items-center gap-3 mb-6">
                  <AssignmentIcon sx={{ fontSize: 28, color: '#6366f1' }} />
                  <Typography variant="h5" className="font-semibold text-gray-900">
                    Sınav Girişi Bilgileri
                  </Typography>
                </Box>
                
                <Stack spacing={3}>
                  {/* Exam Info */}
                  <Box className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                    <Box className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center">
                      <AssignmentIcon sx={{ fontSize: 24, color: '#3b82f6' }} />
                    </Box>
                    <Box className="flex-1">
                      <Typography variant="body2" className="text-blue-600 font-medium mb-1">
                        Sınav
                      </Typography>
                      <Typography variant="h6" className="font-semibold text-gray-900">
                        {submission.examName}
                      </Typography>
                      <Typography variant="body2" className="text-gray-500">
                        Sınav ID: #{submission.examId}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Student Info */}
                  <Box className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                    <Box className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center">
                      <PersonIcon sx={{ fontSize: 24, color: '#10b981' }} />
                    </Box>
                    <Box className="flex-1">
                      <Typography variant="body2" className="text-green-600 font-medium mb-1">
                        Öğrenci
                      </Typography>
                      <Typography variant="h6" className="font-semibold text-gray-900">
                        {submission.studentName}
                      </Typography>
                      <Typography variant="body2" className="text-gray-500">
                        Öğrenci ID: #{submission.studentId}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Submission Date */}
                  <Box className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl border border-purple-100">
                    <Box className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center">
                      <ScheduleIcon sx={{ fontSize: 24, color: '#8b5cf6' }} />
                    </Box>
                    <Box className="flex-1">
                      <Typography variant="body2" className="text-purple-600 font-medium mb-1">
                        Tamamlanma Tarihi
                      </Typography>
                      <Typography variant="h6" className="font-semibold text-gray-900">
                        {formatDate(submission.submittedAt)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Score Info - Only show if completed */}
                  {submission.submittedAt && (
                    <Box className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-100">
                      <Box className="bg-orange-100 w-12 h-12 rounded-xl flex items-center justify-center">
                        <GradeIcon sx={{ fontSize: 24, color: '#f59e0b' }} />
                      </Box>
                      <Box className="flex-1">
                        <Typography variant="body2" className="text-orange-600 font-medium mb-1">
                          Toplam Puan
                        </Typography>
                        <Typography variant="h6" className="font-semibold text-gray-900">
                          {submission.totalScore} puan
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Actions Sidebar */}
        <Grid item xs={12} lg={4}>
          <Card elevation={0} sx={{ 
            borderRadius: '20px', 
            border: '1px solid #e5e7eb',
            backgroundColor: '#ffffff',
            height: 'fit-content'
          }}>
            <CardContent sx={{ p: 5 }}>
              <Typography variant="h6" className="font-semibold text-gray-900 mb-6">
                İşlemler
              </Typography>
              
              <Stack spacing={3}>
                <Button
                  fullWidth
                  variant="text"
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBack}
                  sx={{
                    color: '#6b7280',
                    borderRadius: '16px',
                    textTransform: 'none',
                    fontWeight: 600,
                    py: 2,
                    fontSize: '1rem',
                    '&:hover': {
                      backgroundColor: '#f3f4f6',
                      color: '#374151'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Geri Dön
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ExamSubmissionDetailPage;
