import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Divider
} from '@mui/material';
import {
  QuestionAnswer as QuestionIcon,
  School as SchoolIcon,
  Quiz as QuizIcon,
  Topic as TopicIcon,
  ArrowBack as ArrowBackIcon,
  RadioButtonChecked as RadioIcon,
  CheckCircleOutline as CorrectIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { apiService } from '../utils/apiService';
import { useAuth } from '../hooks/useAuth';
import ExamQuestionEditModal from '../components/ExamQuestionEditModal';
import ExamQuestionDeleteModal from '../components/ExamQuestionDeleteModal';

const QuestionDetailPage = () => {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (questionId) {
      fetchQuestionDetails();
    }
  }, [questionId]);

  const fetchQuestionDetails = async () => {
    if (!questionId) {
      setError('Soru ID bulunamadı');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await apiService.get(`/exam-questions/${questionId}`);
      setQuestion(response);
    } catch (err) {
      setError(err.message || 'Soru detayları yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (question?.examId) {
      navigate(`/exam-detail/${question.examId}`);
    } else {
      navigate('/exam-search');
    }
  };

  const handleEdit = () => {
    setEditModalOpen(true);
  };

  const handleDelete = () => {
    setDeleteModalOpen(true);
  };

  const handleEditSuccess = (updatedQuestion) => {
    setQuestion(updatedQuestion);
    setEditModalOpen(false);
  };

  const handleDeleteSuccess = (deletedQuestionId) => {
    if (question?.examId) {
      navigate(`/exam-detail/${question.examId}`);
    } else {
      navigate('/exam-search');
    }
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

  if (!question) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="warning" className="rounded-xl mb-6">
          Soru bulunamadı
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
          Sınav Detayına Dön
        </Button>

        {/* Question Header Card */}
        <Card elevation={0} sx={{ 
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
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
                  <QuestionIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h4" className="font-bold mb-3 line-clamp-2">
                    {question.questionText}
                  </Typography>
                  <Box className="flex items-center gap-3">
                    <Chip
                      icon={<TopicIcon />}
                      label={question.topicName}
                      size="large"
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        padding: '8px 16px',
                        height: '40px',
                        '& .MuiChip-icon': {
                          color: 'white',
                          fontSize: '20px'
                        },
                        '& .MuiChip-label': {
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          letterSpacing: '0.5px'
                        }
                      }}
                    />
                    <Chip
                      label={`${question.score} puan`}
                      size="large"
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        padding: '8px 16px',
                        height: '40px',
                        '& .MuiChip-label': {
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          letterSpacing: '0.5px'
                        }
                      }}
                    />
                  </Box>
                </Box>
              </Box>
              <Box className="text-right">
                <Typography variant="h6" className="font-semibold opacity-90 mb-1">
                  Soru ID
                </Typography>
                <Typography variant="h4" className="font-bold">
                  #{question.id}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Content Grid */}
      <Box className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Question Details */}
        <Box className="lg:col-span-2">
          <Stack spacing={4}>
            {/* Question Content Card */}
            <Card elevation={0} sx={{ 
              borderRadius: '20px', 
              border: '1px solid #e5e7eb',
              backgroundColor: '#ffffff'
            }}>
              <CardContent sx={{ p: 5 }}>
                <Box className="flex items-center gap-3 mb-6">
                  <QuestionIcon sx={{ fontSize: 28, color: '#8b5cf6' }} />
                  <Typography variant="h5" className="font-semibold text-gray-900">
                    Soru İçeriği
                  </Typography>
                </Box>
                
                <Stack spacing={4}>
                  {/* Question Text */}
                  <Box className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl border border-purple-100">
                    <Typography variant="body2" className="text-purple-600 font-medium mb-2">
                      Soru Metni
                    </Typography>
                    <Typography variant="h6" className="font-semibold text-gray-900 leading-relaxed">
                      {question.questionText}
                    </Typography>
                  </Box>

                  {/* Options */}
                  <Box>
                    <Typography variant="h6" className="font-semibold text-gray-900 mb-4">
                      Seçenekler
                    </Typography>
                    <Stack spacing={2}>
                      {question.options.map((option, optionIndex) => (
                        <Box
                          key={optionIndex}
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                            option === question.correctAnswer
                              ? 'bg-green-50 border-green-300 shadow-sm'
                              : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Box className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            option === question.correctAnswer
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            <Typography variant="body2" className="font-bold">
                              {String.fromCharCode(65 + optionIndex)}
                            </Typography>
                          </Box>
                          <Typography variant="body1" className="flex-1 font-medium">
                            {option}
                          </Typography>
                          {option === question.correctAnswer && (
                            <CorrectIcon sx={{ fontSize: 24, color: '#22c55e' }} />
                          )}
                        </Box>
                      ))}
                    </Stack>
                  </Box>

                  {/* Correct Answer */}
                  <Box className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                    <Typography variant="body2" className="text-green-600 font-medium mb-2">
                      Doğru Cevap
                    </Typography>
                    <Typography variant="h6" className="font-bold text-green-800">
                      {question.correctAnswer}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Box>

        {/* Actions Sidebar */}
        <Box>
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
                {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_TEACHER') && (
                  <>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={handleEdit}
                      sx={{
                        borderColor: '#8b5cf6',
                        color: '#8b5cf6',
                        borderRadius: '16px',
                        textTransform: 'none',
                        fontWeight: 600,
                        py: 2,
                        fontSize: '1rem',
                        borderWidth: '2px',
                        '&:hover': {
                          borderColor: '#7c3aed',
                          color: '#7c3aed',
                          backgroundColor: '#f8fafc',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Soruyu Düzenle
                    </Button>

                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<DeleteIcon />}
                      onClick={handleDelete}
                      sx={{
                        borderColor: '#ef4444',
                        color: '#ef4444',
                        borderRadius: '16px',
                        textTransform: 'none',
                        fontWeight: 600,
                        py: 2,
                        fontSize: '1rem',
                        borderWidth: '2px',
                        '&:hover': {
                          borderColor: '#dc2626',
                          color: '#dc2626',
                          backgroundColor: '#fef2f2',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Soruyu Sil
                    </Button>
                  </>
                )}

                <Divider sx={{ my: 2 }} />

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
        </Box>
      </Box>

      {/* Modals */}
      {question && (
        <>
          <ExamQuestionEditModal
            open={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            question={question}
            onSuccess={handleEditSuccess}
          />
          <ExamQuestionDeleteModal
            open={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            question={question}
            onSuccess={handleDeleteSuccess}
          />
        </>
      )}
    </Container>
  );
};

export default QuestionDetailPage;
