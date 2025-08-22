import { useState, useEffect } from 'react';
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Stack
} from '@mui/material';
import {
  QuestionAnswer as QuestionIcon,
  Close as CloseIcon,
  Topic as TopicIcon
} from '@mui/icons-material';
import { apiService } from '../utils/apiService';

const ExamQuestionEditModal = ({ open, onClose, question, onSuccess }) => {
  const [form, setForm] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    score: 10,
    topicId: ''
  });
  const [topics, setTopics] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [topicsLoading, setTopicsLoading] = useState(false);

  useEffect(() => {
    if (open && question) {
      setForm({
        questionText: question.questionText || '',
        options: question.options || ['', '', '', ''],
        correctAnswer: question.correctAnswer || '',
        score: question.score || 10,
        topicId: question.topicId || ''
      });
      setErrors({});
      fetchTopics();
    }
  }, [open, question]);

  const fetchTopics = async () => {
    if (!question?.examId) return;

    try {
      setTopicsLoading(true);
      
      // First, get the exam details to find the course ID
      const examResponse = await apiService.get(`/exams/${question.examId}`);
      const courseId = examResponse.courseId;
      
      // Then fetch topics for that course
      const response = await apiService.get(`/courses/${courseId}/topics?page=0&size=100&sort=name,asc`);
      setTopics(Array.isArray(response.content) ? response.content : []);
      
      // If we have topicName but no topicId, try to find the topic by name
      if (question.topicName && !question.topicId) {
        const matchingTopic = response.content?.find(topic => topic.name === question.topicName);
        if (matchingTopic) {
          setForm(prev => ({
            ...prev,
            topicId: matchingTopic.id
          }));
        }
      }
    } catch (err) {
      console.error('Konular yüklenirken hata:', err);
    } finally {
      setTopicsLoading(false);
    }
  };

  const handleFormChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...form.options];
    newOptions[index] = value;
    setForm(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.questionText.trim()) {
      newErrors.questionText = 'Soru metni gereklidir';
    }

    if (!form.topicId) {
      newErrors.topicId = 'Konu seçimi gereklidir';
    }

    if (!form.correctAnswer) {
      newErrors.correctAnswer = 'Doğru cevap seçimi gereklidir';
    }

    if (form.score <= 0) {
      newErrors.score = 'Puan 0\'dan büyük olmalıdır';
    }

    const validOptions = form.options.filter(option => option.trim() !== '');
    if (validOptions.length < 2) {
      newErrors.options = 'En az 2 seçenek gereklidir';
    }

    if (!validOptions.includes(form.correctAnswer)) {
      newErrors.correctAnswer = 'Doğru cevap seçenekler arasında olmalıdır';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const validOptions = form.options.filter(option => option.trim() !== '');
      
      const questionData = {
        questionText: form.questionText.trim(),
        options: validOptions,
        correctAnswer: form.correctAnswer,
        score: form.score,
        topicId: parseInt(form.topicId)
      };

      const response = await apiService.put(`/exam-questions/${question.id}`, questionData);
      
      onSuccess(response);
      
    } catch (err) {
      console.error('Soru güncellenirken hata:', err);
      setErrors({
        submit: err.message || 'Soru güncellenirken bir hata oluştu'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      score: 10,
      topicId: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
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
            Soru Düzenle
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
        {errors.submit && (
          <Alert severity="error" className="mb-4 rounded-xl">
            {errors.submit}
          </Alert>
        )}

        <Stack spacing={3}>
          {/* Question Text */}
          <TextField
            fullWidth
            label="Soru Metni"
            multiline
            rows={3}
            value={form.questionText}
            onChange={(e) => handleFormChange('questionText', e.target.value)}
            error={!!errors.questionText}
            helperText={errors.questionText}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px'
              }
            }}
          />

          {/* Topic Selection */}
          <FormControl fullWidth error={!!errors.topicId}>
            <InputLabel>Konu</InputLabel>
            <Select
              value={form.topicId}
              onChange={(e) => handleFormChange('topicId', e.target.value)}
              label="Konu"
              disabled={topicsLoading}
              sx={{ borderRadius: '12px' }}
            >
              {topics.map((topic) => (
                <MenuItem key={topic.id} value={topic.id}>
                  <Box className="flex items-center gap-2">
                    <TopicIcon sx={{ fontSize: 20, color: '#8b5cf6' }} />
                    {topic.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {errors.topicId && (
              <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                {errors.topicId}
              </Typography>
            )}
          </FormControl>

          {/* Options */}
          <Box>
            <Typography variant="h6" className="font-semibold text-gray-900 mb-3">
              Seçenekler
            </Typography>
            <Stack spacing={2}>
              {form.options.map((option, index) => (
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
            {errors.options && (
              <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                {errors.options}
              </Typography>
            )}
          </Box>

          {/* Correct Answer */}
          <FormControl fullWidth error={!!errors.correctAnswer}>
            <InputLabel>Doğru Cevap</InputLabel>
            <Select
              value={form.correctAnswer}
              onChange={(e) => handleFormChange('correctAnswer', e.target.value)}
              label="Doğru Cevap"
              sx={{ borderRadius: '12px' }}
            >
              {form.options
                .filter(option => option.trim() !== '')
                .map((option, index) => (
                  <MenuItem key={index} value={option}>
                    {option}
                  </MenuItem>
                ))}
            </Select>
            {errors.correctAnswer && (
              <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                {errors.correctAnswer}
              </Typography>
            )}
          </FormControl>

          {/* Score */}
          <TextField
            fullWidth
            label="Puan"
            type="number"
            value={form.score}
            onChange={(e) => handleFormChange('score', parseInt(e.target.value) || 0)}
            error={!!errors.score}
            helperText={errors.score}
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
          onClick={handleClose}
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
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
          sx={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            },
          }}
        >
          {loading ? 'Güncelleniyor...' : 'Güncelle'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExamQuestionEditModal;
