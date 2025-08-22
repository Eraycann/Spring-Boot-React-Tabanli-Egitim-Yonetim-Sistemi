import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  Pagination,
  Stack,
  Card,
  CardContent,
  Divider,
  IconButton,
  Tooltip,
  Fade,
  Zoom
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Grade as GradeIcon,
  QuestionAnswer as QuestionAnswerIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Analytics as AnalyticsIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { apiService } from '../utils/apiService';
import { useAuthContext } from '../contexts/AuthContext';

const StudentAnswersPage = () => {
  const { examId } = useParams();
  const { user } = useAuthContext();
  
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [examDetails, setExamDetails] = useState(null);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0
  });

  // Check if user has permission
  const hasPermission = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_TEACHER';

  useEffect(() => {
    if (hasPermission) {
      fetchAnswers();
      fetchExamDetails();
    }
  }, [pagination.pageNumber, examId, hasPermission]);

  const fetchAnswers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        page: pagination.pageNumber.toString(),
        size: pagination.pageSize.toString(),
        sort: 'id,desc'
      });
      
      const response = await apiService.get(`/student-answers/exam/${examId}?${params.toString()}`);
      
      setAnswers(Array.isArray(response.content) ? response.content : []);
      setPagination({
        pageNumber: response.pageNumber || 0,
        pageSize: response.pageSize || 10,
        totalElements: response.totalElements || 0,
        totalPages: response.totalPages || 0
      });
    } catch (err) {
      console.error('Öğrenci cevapları yüklenirken hata:', err);
      setError(err.message || 'Öğrenci cevapları yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchExamDetails = async () => {
    try {
      const response = await apiService.get(`/exams/${examId}`);
      setExamDetails(response);
    } catch (err) {
      console.error('Sınav detayları yüklenirken hata:', err);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({
      ...prev,
      pageNumber: newPage - 1
    }));
  };

  const getCorrectnessChip = (correct) => {
    if (correct) {
      return (
        <Chip
          icon={<CheckCircleIcon />}
          label="Doğru"
          size="small"
          sx={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.75rem',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
            '& .MuiChip-icon': {
              color: 'white',
              fontSize: '16px'
            }
          }}
        />
      );
    }
    return (
      <Chip
        icon={<CancelIcon />}
        label="Yanlış"
        size="small"
        sx={{
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          fontWeight: 600,
          fontSize: '0.75rem',
          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
          '& .MuiChip-icon': {
            color: 'white',
            fontSize: '16px'
          }
        }}
      />
    );
  };

  const getScoreChip = (score) => {
    const percentage = (score / 10) * 100;
    let color = '#ef4444';
    
    if (percentage >= 80) color = '#10b981';
    else if (percentage >= 60) color = '#f59e0b';
    else if (percentage >= 40) color = '#f97316';
    
    return (
      <Chip
        icon={<GradeIcon />}
        label={`${score}/10`}
        size="small"
        sx={{
          background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
          color: 'white',
          fontWeight: 600,
          fontSize: '0.75rem',
          boxShadow: `0 2px 8px ${color}40`,
          '& .MuiChip-icon': {
            color: 'white',
            fontSize: '16px'
          }
        }}
      />
    );
  };

  // Permission check
  if (!hasPermission) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error" className="rounded-2xl">
          Bu sayfaya erişim yetkiniz bulunmamaktadır. Sadece admin ve öğretmenler bu sayfayı görüntüleyebilir.
        </Alert>
      </Container>
    );
  }

  if (loading && answers.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Box className="flex flex-col justify-center items-center h-96">
          <Box className="relative">
            <CircularProgress 
              size={80} 
              sx={{ 
                color: '#6366f1',
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round',
                }
              }} 
            />
            <Box className="absolute inset-0 flex items-center justify-center">
              <QuestionAnswerIcon sx={{ fontSize: 32, color: '#6366f1' }} />
            </Box>
          </Box>
          <Typography variant="h6" className="mt-6 text-gray-600 font-medium">
            Öğrenci cevapları yükleniyor...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 8 }}>
      {/* Hero Header Section */}
      <Box className="mb-12">
        <Box className="text-center mb-8">
          <Box className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl mb-6 shadow-lg">
            <QuestionAnswerIcon sx={{ fontSize: 36, color: 'white' }} />
          </Box>
          <Typography 
            variant="h2" 
            className="font-bold text-gray-900 mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
          >
            Öğrenci Cevapları
          </Typography>
          <Typography variant="h6" className="text-gray-600 font-normal max-w-2xl mx-auto">
            {examDetails?.name && `${examDetails.name} sınavına verilen cevapları görüntüleyin ve analiz edin.`}
            Öğrenci performanslarını detaylı olarak inceleyin.
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} className="mb-8">
          <Grid columns={{ xs: 12, sm: 6, md: 3 }}>
            <Paper elevation={0} sx={{ 
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              p: 3,
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box className="absolute top-0 right-0 w-20 h-20 bg-white bg-opacity-10 rounded-full -mr-10 -mt-10" />
              <Typography variant="h3" className="font-bold mb-2">
                {pagination.totalElements}
              </Typography>
              <Typography variant="body2" className="opacity-90">
                Toplam Cevap
              </Typography>
            </Paper>
          </Grid>
          
          <Grid columns={{ xs: 12, sm: 6, md: 3 }}>
            <Paper elevation={0} sx={{ 
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              p: 3,
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box className="absolute top-0 right-0 w-20 h-20 bg-white bg-opacity-10 rounded-full -mr-10 -mt-10" />
              <Typography variant="h3" className="font-bold mb-2">
                {answers.filter(a => a.correct).length}
              </Typography>
              <Typography variant="body2" className="opacity-90">
                Doğru Cevap
              </Typography>
            </Paper>
          </Grid>
          
          <Grid columns={{ xs: 12, sm: 6, md: 3 }}>
            <Paper elevation={0} sx={{ 
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              p: 3,
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box className="absolute top-0 right-0 w-20 h-20 bg-white bg-opacity-10 rounded-full -mr-10 -mt-10" />
              <Typography variant="h3" className="font-bold mb-2">
                {answers.filter(a => !a.correct).length}
              </Typography>
              <Typography variant="body2" className="opacity-90">
                Yanlış Cevap
              </Typography>
            </Paper>
          </Grid>
          
          <Grid columns={{ xs: 12, sm: 6, md: 3 }}>
            <Paper elevation={0} sx={{ 
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              p: 3,
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box className="absolute top-0 right-0 w-20 h-20 bg-white bg-opacity-10 rounded-full -mr-10 -mt-10" />
              <Typography variant="h3" className="font-bold mb-2">
                {answers.length > 0 ? Math.round((answers.filter(a => a.correct).length / answers.length) * 100) : 0}%
              </Typography>
              <Typography variant="body2" className="opacity-90">
                Doğruluk Oranı
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          className="rounded-2xl mb-6"
          sx={{
            '& .MuiAlert-icon': {
              fontSize: '24px'
            },
            '& .MuiAlert-message': {
              fontSize: '1rem',
              fontWeight: 500
            }
          }}
        >
          {error}
        </Alert>
      )}

      {/* Answers List */}
      {answers.length === 0 ? (
        <Paper elevation={0} sx={{ 
          borderRadius: '24px', 
          border: '1px solid #e5e7eb',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
        }}>
          <Box className="p-12 text-center">
            <Box className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <QuestionAnswerIcon sx={{ fontSize: 48, color: '#6b7280' }} />
            </Box>
            <Typography variant="h5" className="text-gray-700 mb-3 font-semibold">
              Henüz cevap bulunmuyor
            </Typography>
            <Typography variant="body1" className="text-gray-500 max-w-md mx-auto">
              Bu sınav için henüz öğrenci cevabı bulunmuyor. 
              Öğrenciler sınavı tamamladıktan sonra cevaplar burada görünecek.
            </Typography>
          </Box>
        </Paper>
      ) : (
        <Stack spacing={4}>
          {answers.map((answer, index) => (
            <Fade in={true} timeout={300 + (index * 100)} key={answer.id}>
              <Paper elevation={0} sx={{ 
                borderRadius: '24px',
                border: '1px solid #e5e7eb',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  borderColor: answer.correct ? '#10b981' : '#ef4444',
                  boxShadow: `0 20px 40px ${answer.correct ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`,
                  transform: 'translateY(-4px)'
                }
              }}>
                {/* Gradient Border Effect */}
                <Box className={`absolute top-0 left-0 right-0 h-1 ${
                  answer.correct 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                    : 'bg-gradient-to-r from-red-500 to-pink-500'
                }`} />
                
                <Box className="p-6">
                  <Box className="flex items-start justify-between mb-4">
                    <Box className="flex-1">
                      <Typography variant="h6" className="font-bold text-gray-900 mb-3">
                        {answer.questionText}
                      </Typography>
                      
                      <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Given Answer */}
                        <Box className="bg-gray-50 p-4 rounded-xl">
                          <Typography variant="subtitle2" className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <PersonIcon sx={{ fontSize: 16 }} />
                            Verilen Cevap
                          </Typography>
                          <Typography variant="body1" className="text-gray-900 font-medium">
                            {answer.givenAnswer}
                          </Typography>
                        </Box>
                        
                        {/* Correct Answer */}
                        <Box className="bg-green-50 p-4 rounded-xl">
                          <Typography variant="subtitle2" className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                            <CheckCircleIcon sx={{ fontSize: 16 }} />
                            Doğru Cevap
                          </Typography>
                          <Typography variant="body1" className="text-green-900 font-medium">
                            {answer.correctAnswer}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    
                    <Box className="flex flex-col items-end gap-3 ml-4">
                      {getCorrectnessChip(answer.correct)}
                      {getScoreChip(answer.score)}
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box className="flex items-center justify-between">
                    <Box className="flex items-center gap-4">
                      <Typography variant="body2" className="text-gray-500">
                        Cevap ID: #{answer.id}
                      </Typography>
                    </Box>
                    
                    <Box className="flex items-center gap-2">
                      <Typography variant="body2" className="text-gray-500">
                        Puan: {answer.score}/10
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Fade>
          ))}
        </Stack>
      )}

      {/* Enhanced Pagination */}
      {pagination.totalPages > 1 && (
        <Box className="flex justify-center mt-12">
          <Paper elevation={0} sx={{ 
            borderRadius: '20px',
            border: '1px solid #e5e7eb',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            p: 2
          }}>
            <Pagination
              count={pagination.totalPages}
              page={pagination.pageNumber + 1}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '1rem',
                  minWidth: '48px',
                  height: '48px',
                  margin: '0 4px',
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    color: '#ffffff',
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)'
                    }
                  },
                  '&:hover': {
                    backgroundColor: '#e0e7ff',
                    color: '#6366f1'
                  }
                }
              }}
            />
          </Paper>
        </Box>
      )}

      {/* Enhanced Summary */}
      {answers.length > 0 && (
        <Paper elevation={0} sx={{ 
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          mt: 6,
          p: 4,
          textAlign: 'center'
        }}>
          <Box className="flex items-center justify-center gap-2 mb-2">
            <AnalyticsIcon sx={{ fontSize: 24 }} />
            <Typography variant="h6" className="font-semibold">
              Özet Bilgiler
            </Typography>
          </Box>
          <Typography variant="body1" className="opacity-90">
            Toplam <span className="font-bold text-yellow-300">{pagination.totalElements}</span> cevap bulundu
            {' • '}
            <span className="font-bold text-green-300">
              {answers.filter(a => a.correct).length} doğru
            </span>
            {' • '}
            <span className="font-bold text-red-300">
              {answers.filter(a => !a.correct).length} yanlış
            </span>
            {' • '}
            <span className="font-bold text-blue-300">
              Ortalama Puan: {answers.length > 0 ? Math.round(answers.reduce((sum, a) => sum + a.score, 0) / answers.length) : 0}/10
            </span>
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default StudentAnswersPage;
