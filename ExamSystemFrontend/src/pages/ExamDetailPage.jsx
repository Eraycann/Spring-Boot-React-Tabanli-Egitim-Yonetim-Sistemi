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
  Grid,
  Divider,
  Paper,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Pagination,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton
} from '@mui/material';
import {
  Quiz as QuizIcon,
  School as SchoolIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Info as InfoIcon,
  QuestionAnswer as QuestionIcon,
  ExpandMore as ExpandMoreIcon,
  RadioButtonChecked as RadioIcon,
  CheckCircleOutline as CorrectIcon,
  Topic as TopicIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  Start as StartIcon
} from '@mui/icons-material';
import { apiService } from '../utils/apiService';
import { useAuth } from '../hooks/useAuth';
import ExamEditModal from '../components/ExamEditModal';
import ExamDeleteModal from '../components/ExamDeleteModal';
import ExamActivateModal from '../components/ExamActivateModal';

const ExamDetailPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [activateModalOpen, setActivateModalOpen] = useState(false);
  const [addQuestionModalOpen, setAddQuestionModalOpen] = useState(false);

  // Questions states
  const [questions, setQuestions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [questionsPagination, setQuestionsPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0
  });

  // Add question form states
  const [questionForm, setQuestionForm] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    score: 10,
    topicId: ''
  });
  const [questionFormErrors, setQuestionFormErrors] = useState({});
  const [addingQuestion, setAddingQuestion] = useState(false);

  useEffect(() => {
    if (examId) {
      fetchExamDetails();
    }
  }, [examId]);

  useEffect(() => {
    if (exam && (user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_TEACHER')) {
      fetchTopics();
    }
  }, [exam, user]);

  useEffect(() => {
    if (exam && topics.length > 0) {
      fetchQuestions();
    }
  }, [exam, topics, selectedTopicId, questionsPagination.pageNumber]);

  const fetchExamDetails = async () => {
    if (!examId) {
      setError('Sınav ID bulunamadı');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await apiService.get(`/exams/${examId}`);
      setExam(response);
    } catch (err) {
      setError(err.message || 'Sınav detayları yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async () => {
    try {
      const response = await apiService.get(`/courses/${exam.courseId}/topics?page=0&size=100&sort=name,asc`);
      setTopics(Array.isArray(response.content) ? response.content : []);
    } catch (err) {
      console.error('Konular yüklenirken hata:', err);
    }
  };

  const fetchQuestions = async () => {
    try {
      setQuestionsLoading(true);
      
      const params = new URLSearchParams({
        examId: examId,
        page: questionsPagination.pageNumber.toString(),
        size: questionsPagination.pageSize.toString(),
        sort: 'id,desc'
      });

      if (selectedTopicId) {
        params.append('topicId', selectedTopicId);
      }
      
      const response = await apiService.get(`/exam-questions?${params.toString()}`);
      
      setQuestions(Array.isArray(response.content) ? response.content : []);
      setQuestionsPagination({
        pageNumber: response.pageNumber || 0,
        pageSize: response.pageSize || 10,
        totalElements: response.totalElements || 0,
        totalPages: response.totalPages || 0
      });
    } catch (err) {
      console.error('Sorular yüklenirken hata:', err);
      setQuestions([]);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleTopicChange = (event) => {
    setSelectedTopicId(event.target.value);
    setQuestionsPagination(prev => ({ ...prev, pageNumber: 0 }));
  };

  const handleQuestionsPageChange = (event, newPage) => {
    setQuestionsPagination(prev => ({
      ...prev,
      pageNumber: newPage - 1
    }));
  };

  const handleAddQuestion = () => {
    setAddQuestionModalOpen(true);
    setQuestionForm({
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      score: 10,
      topicId: ''
    });
    setQuestionFormErrors({});
  };

  const handleCloseAddQuestionModal = () => {
    setAddQuestionModalOpen(false);
    setQuestionForm({
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      score: 10,
      topicId: ''
    });
    setQuestionFormErrors({});
  };

  const handleQuestionFormChange = (field, value) => {
    setQuestionForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (questionFormErrors[field]) {
      setQuestionFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...questionForm.options];
    newOptions[index] = value;
    setQuestionForm(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const validateQuestionForm = () => {
    const errors = {};

    if (!questionForm.questionText.trim()) {
      errors.questionText = 'Soru metni gereklidir';
    }

    if (!questionForm.topicId) {
      errors.topicId = 'Konu seçimi gereklidir';
    }

    if (!questionForm.correctAnswer) {
      errors.correctAnswer = 'Doğru cevap seçimi gereklidir';
    }

    if (questionForm.score <= 0) {
      errors.score = 'Puan 0\'dan büyük olmalıdır';
    }

    const validOptions = questionForm.options.filter(option => option.trim() !== '');
    if (validOptions.length < 2) {
      errors.options = 'En az 2 seçenek gereklidir';
    }

    if (!validOptions.includes(questionForm.correctAnswer)) {
      errors.correctAnswer = 'Doğru cevap seçenekler arasında olmalıdır';
    }

    setQuestionFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitQuestion = async () => {
    if (!validateQuestionForm()) {
      return;
    }

    try {
      setAddingQuestion(true);

      const validOptions = questionForm.options.filter(option => option.trim() !== '');
      
      const questionData = {
        questionText: questionForm.questionText.trim(),
        options: validOptions,
        correctAnswer: questionForm.correctAnswer,
        score: questionForm.score,
        examId: parseInt(examId),
        topicId: parseInt(questionForm.topicId)
      };

      await apiService.post('/exam-questions', questionData);
      
      // Refresh questions list
      fetchQuestions();
      
      // Close modal and reset form
      handleCloseAddQuestionModal();
      
    } catch (err) {
      console.error('Soru eklenirken hata:', err);
      setQuestionFormErrors({
        submit: err.message || 'Soru eklenirken bir hata oluştu'
      });
    } finally {
      setAddingQuestion(false);
    }
  };

  const handleQuestionClick = (questionId) => {
    if (questionId) {
      navigate(`/question-detail/${questionId}`);
    }
  };

  const handleStartExam = async () => {
    if (!exam?.id) return;

    try {
      // Create exam submission
      const submissionData = {
        examId: exam.id
      };

      const response = await apiService.post('/exam-submissions', submissionData);
      
      // Navigate to exam taking page
      navigate(`/take-exam/${exam.id}`, { 
        state: { 
          submissionId: response.id,
          examName: exam.name,
          durationInMinutes: exam.durationInMinutes
        }
      });
      
    } catch (err) {
      console.error('Sınav başlatılırken hata:', err);
      // You might want to show an error message to the user
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours} saat ${remainingMinutes > 0 ? `${remainingMinutes} dakika` : ''}`;
    }
    return `${minutes} dakika`;
  };

  const handleBack = () => {
    navigate('/exam-search');
  };

  const handleEdit = () => {
    setEditModalOpen(true);
  };

  const handleDelete = () => {
    setDeleteModalOpen(true);
  };

  const handleActivate = () => {
    setActivateModalOpen(true);
  };

  const handleEditSuccess = (updatedExam) => {
    setExam(updatedExam);
    setEditModalOpen(false);
  };

  const handleDeleteSuccess = (deletedExamId) => {
    navigate('/exam-search');
  };

  const handleActivateSuccess = (activatedExam) => {
    setExam(activatedExam);
    setActivateModalOpen(false);
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

  if (!exam) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="warning" className="rounded-xl mb-6">
          Sınav bulunamadı
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
          Sınav Aramaya Dön
        </Button>

        {/* Exam Header Card */}
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
                  <QuizIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h3" className="font-bold mb-3">
                    {exam.name}
                  </Typography>
                  <Box className="flex items-center gap-3">
                    <Chip
                      icon={exam.active ? <CheckCircleIcon /> : <CancelIcon />}
                      label={exam.active ? 'AKTİF' : 'PASİF'}
                      size="large"
                      sx={{
                        backgroundColor: exam.active ? '#22c55e' : '#ef4444',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        padding: '8px 16px',
                        height: '40px',
                        '& .MuiChip-icon': {
                          color: 'white',
                          fontSize: '20px'
                        },
                        '& .MuiChip-label': {
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          letterSpacing: '0.5px'
                        }
                      }}
                    />
                    <Typography variant="body1" className="opacity-90 font-medium">
                      {exam.active ? 'Sınav aktif durumda' : 'Sınav pasif durumda'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box className="text-right">
                <Typography variant="h6" className="font-semibold opacity-90 mb-1">
                  Sınav ID
                </Typography>
                <Typography variant="h4" className="font-bold">
                  #{exam.id}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Content Grid */}
      <Grid container spacing={4}>
        {/* Exam Details */}
        <Grid item xs={12} lg={8}>
          <Stack spacing={4}>
            {/* Exam Info Card */}
            <Card elevation={0} sx={{ 
              borderRadius: '20px', 
              border: '1px solid #e5e7eb',
              backgroundColor: '#ffffff'
            }}>
              <CardContent sx={{ p: 5 }}>
                <Box className="flex items-center gap-3 mb-6">
                  <InfoIcon sx={{ fontSize: 28, color: '#6366f1' }} />
                  <Typography variant="h5" className="font-semibold text-gray-900">
                    Sınav Bilgileri
                  </Typography>
                </Box>
                
                <Stack spacing={3}>
                  {/* Course Info */}
                  <Box className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                    <Box className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center">
                      <SchoolIcon sx={{ fontSize: 24, color: '#3b82f6' }} />
                    </Box>
                    <Box className="flex-1">
                      <Typography variant="body2" className="text-blue-600 font-medium mb-1">
                        Kurs
                      </Typography>
                      <Typography variant="h6" className="font-semibold text-gray-900">
                        {exam.courseName}
                      </Typography>
                      <Typography variant="body2" className="text-gray-500">
                        Kurs ID: #{exam.courseId}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Duration Info */}
                  <Box className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                    <Box className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center">
                      <ScheduleIcon sx={{ fontSize: 24, color: '#10b981' }} />
                    </Box>
                    <Box className="flex-1">
                      <Typography variant="body2" className="text-green-600 font-medium mb-1">
                        Süre
                      </Typography>
                      <Typography variant="h6" className="font-semibold text-gray-900">
                        {formatDuration(exam.durationInMinutes)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Status Info */}
                  <Box className={`flex items-center gap-4 p-4 rounded-2xl border ${
                    exam.active 
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-100' 
                      : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-100'
                  }`}>
                    <Box className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      exam.active ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {exam.active ? (
                        <CheckCircleIcon sx={{ fontSize: 24, color: '#22c55e' }} />
                      ) : (
                        <CancelIcon sx={{ fontSize: 24, color: '#ef4444' }} />
                      )}
                    </Box>
                    <Box className="flex-1">
                      <Typography variant="body2" className={`font-medium mb-1 ${
                        exam.active ? 'text-green-600' : 'text-red-600'
                      }`}>
                        Durum
                      </Typography>
                      <Typography variant="h6" className="font-semibold text-gray-900">
                        {exam.active ? 'Aktif' : 'Pasif'}
                      </Typography>
                      <Typography variant="body2" className="text-gray-500">
                        {exam.active ? 'Sınav şu anda aktif ve kullanılabilir' : 'Sınav şu anda pasif ve kullanılamaz'}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Questions Section - Only for Admin/Teacher */}
            {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_TEACHER') && (
              <Card elevation={0} sx={{ 
                borderRadius: '20px', 
                border: '1px solid #e5e7eb',
                backgroundColor: '#ffffff'
              }}>
                <CardContent sx={{ p: 5 }}>
                  <Box className="flex items-center justify-between mb-6">
                    <Box className="flex items-center gap-3">
                      <QuestionIcon sx={{ fontSize: 28, color: '#6366f1' }} />
                      <Typography variant="h5" className="font-semibold text-gray-900">
                        Sınav Soruları
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAddQuestion}
                      sx={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                          transform: 'translateY(-1px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Soru Ekle
                    </Button>
                  </Box>

                  {/* Topic Filter */}
                  <Box className="mb-6">
                    <FormControl fullWidth sx={{ maxWidth: 300 }}>
                      <InputLabel>Konu Filtrele</InputLabel>
                      <Select
                        value={selectedTopicId}
                        onChange={handleTopicChange}
                        label="Konu Filtrele"
                        sx={{ borderRadius: '12px' }}
                      >
                        <MenuItem value="">Tüm Konular</MenuItem>
                        {topics.map((topic) => (
                          <MenuItem key={topic.id} value={topic.id}>
                            {topic.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Questions List */}
                  {questionsLoading ? (
                    <Box className="flex justify-center items-center h-32">
                      <CircularProgress size={40} sx={{ color: '#6366f1' }} />
                    </Box>
                  ) : questions.length === 0 ? (
                    <Box className="text-center py-8">
                      <Box className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <QuestionIcon sx={{ fontSize: 32, color: '#6b7280' }} />
                      </Box>
                      <Typography variant="h6" className="text-gray-600 mb-2">
                        Soru bulunamadı
                      </Typography>
                      <Typography variant="body2" className="text-gray-500">
                        {selectedTopicId ? 'Seçilen konuda soru bulunmuyor' : 'Bu sınava henüz soru eklenmemiş'}
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={3}>
                      {questions.map((question, index) => (
                        <Accordion key={question.id} sx={{ 
                          borderRadius: '16px',
                          border: '1px solid #e5e7eb',
                          '&:before': { display: 'none' },
                          '&.Mui-expanded': {
                            margin: '8px 0'
                          },
                          cursor: 'pointer',
                          '&:hover': {
                            borderColor: '#8b5cf6',
                            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.15)'
                          },
                          transition: 'all 0.2s ease'
                        }}>
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuestionClick(question.id);
                            }}
                            sx={{
                              borderRadius: '16px',
                              '&.Mui-expanded': {
                                borderBottom: '1px solid #e5e7eb'
                              },
                              '&:hover': {
                                backgroundColor: 'rgba(139, 92, 246, 0.05)'
                              }
                            }}
                          >
                            <Box className="flex items-center gap-3 w-full">
                              <Box className="bg-indigo-100 w-10 h-10 rounded-lg flex items-center justify-center">
                                <Typography variant="body2" className="font-bold text-indigo-600">
                                  {questionsPagination.pageNumber * questionsPagination.pageSize + index + 1}
                                </Typography>
                              </Box>
                              <Box className="flex-1">
                                <Typography variant="h6" className="font-semibold text-gray-900 line-clamp-2">
                                  {question.questionText}
                                </Typography>
                                <Box className="flex items-center gap-2 mt-1">
                                  <Chip
                                    icon={<TopicIcon />}
                                    label={question.topicName}
                                    size="small"
                                    sx={{
                                      backgroundColor: '#fef3c7',
                                      color: '#92400e',
                                      fontWeight: 600,
                                      fontSize: '0.75rem'
                                    }}
                                  />
                                  <Chip
                                    label={`${question.score} puan`}
                                    size="small"
                                    sx={{
                                      backgroundColor: '#f0f9ff',
                                      color: '#0369a1',
                                      fontWeight: 600,
                                      fontSize: '0.75rem'
                                    }}
                                  />
                                  <Chip
                                    icon={<VisibilityIcon />}
                                    label="Detay"
                                    size="small"
                                    sx={{
                                      backgroundColor: '#f3e8ff',
                                      color: '#7c3aed',
                                      fontWeight: 600,
                                      fontSize: '0.75rem',
                                      cursor: 'pointer',
                                      '&:hover': {
                                        backgroundColor: '#e9d5ff'
                                      }
                                    }}
                                  />
                                </Box>
                              </Box>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails sx={{ pt: 2 }}>
                            <Stack spacing={2}>
                              <Typography variant="body2" className="text-gray-600 font-medium">
                                Seçenekler:
                              </Typography>
                              {question.options.map((option, optionIndex) => (
                                <Box
                                  key={optionIndex}
                                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                                    option === question.correctAnswer
                                      ? 'bg-green-50 border-green-200'
                                      : 'bg-gray-50 border-gray-200'
                                  }`}
                                >
                                  <RadioIcon sx={{ 
                                    fontSize: 20, 
                                    color: option === question.correctAnswer ? '#22c55e' : '#6b7280' 
                                  }} />
                                  <Typography variant="body1" className="flex-1">
                                    {option}
                                  </Typography>
                                  {option === question.correctAnswer && (
                                    <CorrectIcon sx={{ fontSize: 20, color: '#22c55e' }} />
                                  )}
                                </Box>
                              ))}
                              <Box className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <Typography variant="body2" className="text-blue-600 font-medium mb-1">
                                  Doğru Cevap:
                                </Typography>
                                <Typography variant="body1" className="font-semibold text-blue-800">
                                  {question.correctAnswer}
                                </Typography>
                              </Box>
                            </Stack>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Stack>
                  )}

                  {/* Questions Pagination */}
                  {questionsPagination.totalPages > 1 && (
                    <Box className="flex justify-center mt-6">
                      <Pagination
                        count={questionsPagination.totalPages}
                        page={questionsPagination.pageNumber + 1}
                        onChange={handleQuestionsPageChange}
                        color="primary"
                        size="large"
                        sx={{
                          '& .MuiPaginationItem-root': {
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            '&.Mui-selected': {
                              backgroundColor: '#6366f1',
                              color: '#ffffff',
                              '&:hover': {
                                backgroundColor: '#4f46e5'
                              }
                            }
                          }
                        }}
                      />
                    </Box>
                  )}

                  {/* Questions Summary */}
                  {questions.length > 0 && (
                    <Box className="mt-4 p-4 bg-gray-50 rounded-xl">
                      <Typography variant="body2" className="text-gray-600">
                        Toplam <span className="font-semibold text-indigo-600">{questionsPagination.totalElements}</span> soru bulundu
                        {selectedTopicId && (
                          <span> (filtrelenmiş)</span>
                        )}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}
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
                {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_TEACHER') && (
                  <>
                    {!exam.active && (
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<PlayIcon />}
                        onClick={handleActivate}
                        sx={{
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          borderRadius: '16px',
                          textTransform: 'none',
                          fontWeight: 600,
                          py: 2,
                          fontSize: '1rem',
                          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                            boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
                            transform: 'translateY(-2px)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Sınavı Etkinleştir
                      </Button>
                    )}

                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={handleEdit}
                      sx={{
                        borderColor: '#6366f1',
                        color: '#6366f1',
                        borderRadius: '16px',
                        textTransform: 'none',
                        fontWeight: 600,
                        py: 2,
                        fontSize: '1rem',
                        borderWidth: '2px',
                        '&:hover': {
                          borderColor: '#4f46e5',
                          color: '#4f46e5',
                          backgroundColor: '#f8fafc',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Sınavı Düzenle
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
                      Sınavı Sil
                    </Button>
                  </>
                )}

                {/* Student Actions */}
                {user?.role === 'ROLE_STUDENT' && exam.active && (
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<StartIcon />}
                    onClick={handleStartExam}
                    sx={{
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      borderRadius: '16px',
                      textTransform: 'none',
                      fontWeight: 600,
                      py: 2,
                      fontSize: '1rem',
                      boxShadow: '0 4px 14px rgba(139, 92, 246, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                        boxShadow: '0 6px 20px rgba(139, 92, 246, 0.4)',
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Sınava Başla
                  </Button>
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
        </Grid>
      </Grid>

      {/* Add Question Modal */}
      <Dialog
        open={addQuestionModalOpen}
        onClose={handleCloseAddQuestionModal}
        maxWidth="md"
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
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
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
              Yeni Soru Ekle
            </Typography>
          </Box>
          <IconButton
            onClick={handleCloseAddQuestionModal}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          {questionFormErrors.submit && (
            <Alert severity="error" className="mb-4 rounded-xl">
              {questionFormErrors.submit}
            </Alert>
          )}

          <Stack spacing={3}>
            {/* Question Text */}
            <TextField
              fullWidth
              label="Soru Metni"
              multiline
              rows={3}
              value={questionForm.questionText}
              onChange={(e) => handleQuestionFormChange('questionText', e.target.value)}
              error={!!questionFormErrors.questionText}
              helperText={questionFormErrors.questionText}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px'
                }
              }}
            />

            {/* Topic Selection */}
            <FormControl fullWidth error={!!questionFormErrors.topicId}>
              <InputLabel>Konu</InputLabel>
              <Select
                value={questionForm.topicId}
                onChange={(e) => handleQuestionFormChange('topicId', e.target.value)}
                label="Konu"
                sx={{ borderRadius: '12px' }}
              >
                {topics.map((topic) => (
                  <MenuItem key={topic.id} value={topic.id}>
                    {topic.name}
                  </MenuItem>
                ))}
              </Select>
              {questionFormErrors.topicId && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  {questionFormErrors.topicId}
                </Typography>
              )}
            </FormControl>

            {/* Options */}
            <Box>
              <Typography variant="h6" className="font-semibold text-gray-900 mb-3">
                Seçenekler
              </Typography>
              <Stack spacing={2}>
                {questionForm.options.map((option, index) => (
                  <TextField
                    key={index}
                    fullWidth
                    label={`Seçenek ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px'
                      }
                    }}
                  />
                ))}
              </Stack>
              {questionFormErrors.options && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  {questionFormErrors.options}
                </Typography>
              )}
            </Box>

            {/* Correct Answer */}
            <FormControl fullWidth error={!!questionFormErrors.correctAnswer}>
              <InputLabel>Doğru Cevap</InputLabel>
              <Select
                value={questionForm.correctAnswer}
                onChange={(e) => handleQuestionFormChange('correctAnswer', e.target.value)}
                label="Doğru Cevap"
                sx={{ borderRadius: '12px' }}
              >
                {questionForm.options
                  .filter(option => option.trim() !== '')
                  .map((option, index) => (
                    <MenuItem key={index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
              </Select>
              {questionFormErrors.correctAnswer && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  {questionFormErrors.correctAnswer}
                </Typography>
              )}
            </FormControl>

            {/* Score */}
            <TextField
              fullWidth
              label="Puan"
              type="number"
              value={questionForm.score}
              onChange={(e) => handleQuestionFormChange('score', parseInt(e.target.value) || 0)}
              error={!!questionFormErrors.score}
              helperText={questionFormErrors.score}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px'
                }
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={handleCloseAddQuestionModal}
            variant="outlined"
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
            onClick={handleSubmitQuestion}
            variant="contained"
            disabled={addingQuestion}
            startIcon={addingQuestion ? <CircularProgress size={20} /> : null}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
              },
            }}
          >
            {addingQuestion ? 'Ekleniyor...' : 'Soru Ekle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modals */}
      {exam && (
        <>
          <ExamEditModal
            open={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            exam={exam}
            onSuccess={handleEditSuccess}
          />
          <ExamDeleteModal
            open={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            exam={exam}
            onSuccess={handleDeleteSuccess}
          />
          <ExamActivateModal
            open={activateModalOpen}
            onClose={() => setActivateModalOpen(false)}
            exam={exam}
            onSuccess={handleActivateSuccess}
          />
        </>
      )}
    </Container>
  );
};

export default ExamDetailPage;
