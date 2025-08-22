import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import {
  Quiz as QuizIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  Timer as TimerIcon,
  Close as CloseIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { apiService } from '../utils/apiService';
import { useAuth } from '../hooks/useAuth';

const TakeExamPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const submitButtonRef = useRef(null);

  // Get submission data from navigation state
  const submissionId = location.state?.submissionId;
  const examName = location.state?.examName;
  const durationInMinutes = location.state?.durationInMinutes;

  useEffect(() => {
    if (examId) {
      fetchExamDetails();
      fetchQuestions();
    }
  }, [examId]);

  useEffect(() => {
    if (durationInMinutes) {
      setTimeLeft(durationInMinutes * 60); // Convert to seconds
    }
  }, [durationInMinutes]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const fetchExamDetails = async () => {
    try {
      const response = await apiService.get(`/exams/${examId}`);
      setExam(response);
    } catch (err) {
      setError('Sınav detayları yüklenirken bir hata oluştu');
    }
  };

  const fetchQuestions = async () => {
    try {
      const params = new URLSearchParams({
        examId: examId,
        page: '0',
        size: '100',
        sort: 'id,asc'
      });
      
      const response = await apiService.get(`/exam-questions?${params.toString()}`);
      setQuestions(Array.isArray(response.content) ? response.content : []);
    } catch (err) {
      setError('Sınav soruları yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = async (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    
    // Automatically submit answer to backend
    await handleSubmitAnswer(questionId, answer);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitAnswer = async (questionId, answer) => {
    if (!submissionId || !answer) return;

    try {
      const answerData = {
        submissionId: submissionId,
        questionId: questionId,
        givenAnswer: answer
      };

      await apiService.post('/student-answers', answerData);
    } catch (err) {
      console.error('Cevap gönderilirken hata:', err);
    }
  };

  const handleSubmitExam = async () => {
    setSubmitting(true);
    
    try {
      // Update submission as completed using the new endpoint
      await apiService.put(`/exam-submissions/${submissionId}/submit`);
      
      // Navigate to results page or back to exam search
      navigate('/exam-search', { 
        state: { 
          message: 'Sınavınız başarıyla tamamlandı!',
          examName: examName 
        }
      });
      
    } catch (err) {
      console.error('Sınav gönderilirken hata:', err);
      setError('Sınav gönderilirken bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];

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
          onClick={() => navigate('/exam-search')}
          startIcon={<ArrowBackIcon />}
          sx={{ borderRadius: '12px' }}
        >
          Geri Dön
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box className="mb-6">
        <Card elevation={0} sx={{ 
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          borderRadius: '20px',
          color: 'white'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box className="flex items-center justify-between">
              <Box className="flex items-center gap-4">
                <Box className="bg-white bg-opacity-20 w-12 h-12 rounded-xl flex items-center justify-center">
                  <QuizIcon sx={{ fontSize: 24, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h5" className="font-bold mb-1">
                    {examName || 'Sınav'}
                  </Typography>
                  <Typography variant="body2" className="opacity-90">
                    Soru {currentQuestionIndex + 1} / {questions.length}
                  </Typography>
                  <Box className="w-full bg-white bg-opacity-20 rounded-full h-2 mt-2">
                    <Box 
                      className="bg-white h-2 rounded-full transition-all duration-300"
                      sx={{ 
                        width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` 
                      }}
                    />
                  </Box>
                </Box>
              </Box>
              
              {/* Timer */}
              <Box className="flex items-center gap-3">
                <Box className="bg-white bg-opacity-20 px-4 py-2 rounded-xl flex items-center gap-2">
                  <TimerIcon sx={{ fontSize: 20 }} />
                  <Typography variant="h6" className="font-bold">
                    {formatTime(timeLeft)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Question Content */}
      {currentQuestion && (
        <Card elevation={0} sx={{ 
          borderRadius: '20px', 
          border: '1px solid #e5e7eb',
          backgroundColor: '#ffffff',
          mb: 4
        }}>
          <CardContent sx={{ p: 5 }}>
            {/* Question Header */}
            <Box className="flex items-center justify-between mb-6">
              <Box className="flex items-center gap-3">
                <Box className="bg-purple-100 w-10 h-10 rounded-lg flex items-center justify-center">
                  <Typography variant="body2" className="font-bold text-purple-600">
                    {currentQuestionIndex + 1}
                  </Typography>
                </Box>
                <Typography variant="h6" className="font-semibold text-gray-900">
                  Soru {currentQuestionIndex + 1}
                </Typography>
              </Box>
              <Chip
                label={`${currentQuestion.score} puan`}
                size="small"
                sx={{
                  backgroundColor: '#f0f9ff',
                  color: '#0369a1',
                  fontWeight: 600
                }}
              />
            </Box>

            {/* Question Text */}
            <Typography variant="h6" className="font-semibold text-gray-900 mb-6 leading-relaxed">
              {currentQuestion.questionText}
            </Typography>

            {/* Options */}
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              >
                {currentQuestion.options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={option}
                    control={
                      <Radio 
                        sx={{
                          color: '#8b5cf6',
                          '&.Mui-checked': {
                            color: '#7c3aed'
                          }
                        }}
                      />
                    }
                    label={
                      <Typography variant="body1" className="font-medium">
                        {option}
                      </Typography>
                    }
                    sx={{
                      margin: '8px 0',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      backgroundColor: '#f9fafb',
                      '&:hover': {
                        backgroundColor: '#f3f4f6',
                        borderColor: '#8b5cf6'
                      },
                      '&.Mui-checked': {
                        backgroundColor: '#f3e8ff',
                        borderColor: '#8b5cf6'
                      }
                    }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </CardContent>
        </Card>
      )}

      {/* Question Navigation */}
      <Box className="mb-6">
        <Card elevation={0} sx={{ 
          borderRadius: '16px', 
          border: '1px solid #e5e7eb',
          backgroundColor: '#ffffff'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" className="font-semibold text-gray-900 mb-3">
              Soru Navigasyonu
            </Typography>
            <Box className="flex flex-wrap gap-2">
              {questions.map((question, index) => (
                <Button
                  key={question.id}
                  variant={currentQuestionIndex === index ? "contained" : "outlined"}
                  size="small"
                  onClick={() => setCurrentQuestionIndex(index)}
                  sx={{
                    minWidth: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    backgroundColor: currentQuestionIndex === index 
                      ? '#8b5cf6' 
                      : answers[question.id] 
                        ? '#dcfce7' 
                        : '#f3f4f6',
                    color: currentQuestionIndex === index 
                      ? 'white' 
                      : answers[question.id] 
                        ? '#166534' 
                        : '#6b7280',
                    borderColor: answers[question.id] ? '#22c55e' : '#d1d5db',
                    '&:hover': {
                      backgroundColor: currentQuestionIndex === index 
                        ? '#7c3aed' 
                        : answers[question.id] 
                          ? '#bbf7d0' 
                          : '#e5e7eb'
                    }
                  }}
                >
                  {index + 1}
                </Button>
              ))}
            </Box>
            <Box className="flex items-center gap-4 mt-3 text-sm">
              <Box className="flex items-center gap-2">
                <Box className="w-3 h-3 rounded-full bg-green-500" />
                <Typography variant="body2" className="text-gray-600">Cevaplandı</Typography>
              </Box>
              <Box className="flex items-center gap-2">
                <Box className="w-3 h-3 rounded-full bg-gray-300" />
                <Typography variant="body2" className="text-gray-600">Cevaplanmadı</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Navigation */}
      <Box className="flex items-center justify-between">
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
          sx={{
            borderColor: '#8b5cf6',
            color: '#8b5cf6',
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              borderColor: '#7c3aed',
              color: '#7c3aed',
              backgroundColor: '#f8fafc'
            }
          }}
        >
          Önceki Soru
        </Button>

        <Box className="flex items-center gap-3">
          <Button
            variant="outlined"
            endIcon={<ArrowForwardIcon />}
            onClick={handleNextQuestion}
            disabled={currentQuestionIndex === questions.length - 1}
            sx={{
              borderColor: '#8b5cf6',
              color: '#8b5cf6',
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                borderColor: '#7c3aed',
                color: '#7c3aed',
                backgroundColor: '#f8fafc'
              }
            }}
          >
            Sonraki Soru
          </Button>

          <Button
            variant="contained"
            startIcon={<CheckCircleIcon />}
            onClick={() => setShowSubmitDialog(true)}
            disabled={Object.keys(answers).length < questions.length}
            sx={{
              background: Object.keys(answers).length >= questions.length 
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                background: Object.keys(answers).length >= questions.length
                  ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                  : 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
              },
              '&:disabled': {
                background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                color: '#ffffff'
              }
            }}
          >
            {Object.keys(answers).length >= questions.length ? 'Sınavı Bitir' : `${Object.keys(answers).length}/${questions.length} Soru Cevaplandı`}
          </Button>
        </Box>
      </Box>

             {/* Submit Confirmation Dialog */}
       <Dialog
         open={showSubmitDialog}
         onClose={() => setShowSubmitDialog(false)}
         maxWidth="sm"
         fullWidth
         disableRestoreFocus
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
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            borderRadius: '20px 20px 0 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Box className="flex items-center gap-2">
            <CheckCircleIcon />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Sınavı Bitir
            </Typography>
          </Box>
                     <IconButton
             onClick={() => {
               setShowSubmitDialog(false);
               // Focus'u modal dışına taşı
               setTimeout(() => {
                 submitButtonRef.current?.focus();
               }, 100);
             }}
             sx={{ color: 'white' }}
           >
             <CloseIcon />
           </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Box className="text-center py-4">
            <Box className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <WarningIcon sx={{ fontSize: 32, color: '#10b981' }} />
            </Box>
            
            <Typography variant="h6" className="font-semibold text-gray-900 mb-3">
              Sınavı bitirmek istediğinizden emin misiniz?
            </Typography>
            
                         <Typography variant="body1" className="text-gray-600 mb-4">
               Bu işlem geri alınamaz. Sınavınız tamamlanacak ve puanınız hesaplanacaktır.
             </Typography>
             
             {Object.keys(answers).length < questions.length && (
               <Alert severity="warning" className="mb-4">
                 <Typography variant="body2">
                   <strong>Uyarı:</strong> Henüz {questions.length - Object.keys(answers).length} soru cevaplanmamış. 
                   Tüm soruları cevaplamadan sınavı bitirmek istediğinizden emin misiniz?
                 </Typography>
               </Alert>
             )}

            <Box className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <Typography variant="body2" className="text-gray-600 font-medium mb-2">
                Sınav Özeti:
              </Typography>
              <Box className="flex items-center justify-between">
                <Typography variant="body2" className="text-gray-500">
                  Toplam Soru: {questions.length}
                </Typography>
                <Typography variant="body2" className="text-gray-500">
                  Cevaplanan: {Object.keys(answers).length}
                </Typography>
              </Box>
              <Box className="mt-2">
                <Typography variant="body2" className="text-gray-500">
                  Cevaplanmamış: {questions.length - Object.keys(answers).length}
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setShowSubmitDialog(false)}
            variant="outlined"
            disabled={submitting}
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
            onClick={handleSubmitExam}
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
            sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              },
            }}
          >
            {submitting ? 'Gönderiliyor...' : 'Evet, Bitir'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TakeExamPage;
