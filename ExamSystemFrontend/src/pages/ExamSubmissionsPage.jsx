import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Pagination,
  Stack,
  InputAdornment
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Grade as GradeIcon
} from '@mui/icons-material';
import { apiService } from '../utils/apiService';

const ExamSubmissionsPage = () => {
  const navigate = useNavigate();
  
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search and filter states
  const [searchParams, setSearchParams] = useState({
    examId: '',
    courseId: '',
    studentId: ''
  });
  const [sortBy, setSortBy] = useState('id,desc');
  
  // Pagination state
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchSubmissions();
  }, [searchParams, sortBy, pagination.pageNumber]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        page: pagination.pageNumber.toString(),
        size: pagination.pageSize.toString(),
        sort: sortBy
      });

      // Add search parameters if they exist
      if (searchParams.examId) params.append('examId', searchParams.examId);
      if (searchParams.courseId) params.append('courseId', searchParams.courseId);
      if (searchParams.studentId) params.append('studentId', searchParams.studentId);
      
      const response = await apiService.get(`/exam-submissions?${params.toString()}`);
      
      setSubmissions(Array.isArray(response.content) ? response.content : []);
      setPagination({
        pageNumber: response.pageNumber || 0,
        pageSize: response.pageSize || 10,
        totalElements: response.totalElements || 0,
        totalPages: response.totalPages || 0
      });
    } catch (err) {
      console.error('Sınav girişleri yüklenirken hata:', err);
      setError(err.message || 'Sınav girişleri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (field, value) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
    setPagination(prev => ({ ...prev, pageNumber: 0 }));
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setPagination(prev => ({ ...prev, pageNumber: 0 }));
  };

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({
      ...prev,
      pageNumber: newPage - 1
    }));
  };

  const handleViewDetails = (submissionId) => {
    navigate(`/exam-submission-detail/${submissionId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Henüz tamamlanmadı';
    return new Date(dateString).toLocaleString('tr-TR');
  };

  const getStatusChip = (submittedAt) => {
    if (submittedAt) {
      return (
        <Chip
          label="Tamamlandı"
          size="small"
          sx={{
            backgroundColor: '#dcfce7',
            color: '#166534',
            fontWeight: 600,
            fontSize: '0.75rem'
          }}
        />
      );
    }
    return (
      <Chip
        label="Devam Ediyor"
        size="small"
        sx={{
          backgroundColor: '#fef3c7',
          color: '#92400e',
          fontWeight: 600,
          fontSize: '0.75rem'
        }}
      />
    );
  };

  if (loading && submissions.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box className="flex justify-center items-center h-96">
          <CircularProgress size={48} sx={{ color: '#6366f1' }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Header */}
      <Box className="mb-8">
        <Box className="flex items-center gap-3 mb-4">
          <Box className="bg-indigo-100 w-12 h-12 rounded-xl flex items-center justify-center">
            <AssignmentIcon sx={{ fontSize: 28, color: '#6366f1' }} />
          </Box>
          <Box>
            <Typography variant="h4" className="font-bold text-gray-900 mb-1">
              Sınav Girişleri
            </Typography>
            <Typography variant="body1" className="text-gray-600">
              Tüm sınav girişlerini görüntüleyin ve yönetin
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Search and Filter Section */}
      <Card elevation={0} sx={{ 
        borderRadius: '20px', 
        border: '1px solid #e5e7eb',
        backgroundColor: '#ffffff',
        mb: 4
      }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" className="font-semibold text-gray-900 mb-4">
            Arama ve Filtreleme
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Sınav ID"
                value={searchParams.examId}
                onChange={(e) => handleSearchChange('examId', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AssignmentIcon sx={{ color: '#6b7280', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px'
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Kurs ID"
                value={searchParams.courseId}
                onChange={(e) => handleSearchChange('courseId', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SchoolIcon sx={{ color: '#6b7280', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px'
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Öğrenci ID"
                value={searchParams.studentId}
                onChange={(e) => handleSearchChange('studentId', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: '#6b7280', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px'
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sıralama</InputLabel>
                <Select
                  value={sortBy}
                  onChange={handleSortChange}
                  label="Sıralama"
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="id,desc">ID (Azalan)</MenuItem>
                  <MenuItem value="id,asc">ID (Artan)</MenuItem>
                  <MenuItem value="submittedAt,desc">Tamamlanma Tarihi (Azalan)</MenuItem>
                  <MenuItem value="submittedAt,asc">Tamamlanma Tarihi (Artan)</MenuItem>
                  <MenuItem value="totalScore,desc">Puan (Azalan)</MenuItem>
                  <MenuItem value="totalScore,asc">Puan (Artan)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" className="rounded-xl mb-6">
          {error}
        </Alert>
      )}

      {/* Submissions List */}
      {submissions.length === 0 ? (
        <Card elevation={0} sx={{ 
          borderRadius: '20px', 
          border: '1px solid #e5e7eb',
          backgroundColor: '#ffffff'
        }}>
          <CardContent sx={{ p: 8, textAlign: 'center' }}>
            <Box className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <AssignmentIcon sx={{ fontSize: 32, color: '#6b7280' }} />
            </Box>
            <Typography variant="h6" className="text-gray-600 mb-2">
              Sınav girişi bulunamadı
            </Typography>
            <Typography variant="body2" className="text-gray-500">
              Arama kriterlerinize uygun sınav girişi bulunmuyor
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={3}>
          {submissions.map((submission) => (
            <Card key={submission.id} elevation={0} sx={{ 
              borderRadius: '20px', 
              border: '1px solid #e5e7eb',
              backgroundColor: '#ffffff',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: '#8b5cf6',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.15)',
                transform: 'translateY(-2px)'
              }
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box className="flex items-center justify-between">
                  <Box className="flex items-center gap-4">
                    <Box className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center">
                      <AssignmentIcon sx={{ fontSize: 24, color: '#7c3aed' }} />
                    </Box>
                    
                    <Box className="flex-1">
                      <Typography variant="h6" className="font-semibold text-gray-900 mb-2">
                        {submission.examName}
                      </Typography>
                      
                      <Box className="flex items-center gap-4 flex-wrap">
                        <Box className="flex items-center gap-2">
                          <PersonIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                          <Typography variant="body2" className="text-gray-600">
                            {submission.studentName}
                          </Typography>
                        </Box>
                        
                        <Box className="flex items-center gap-2">
                          <ScheduleIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                          <Typography variant="body2" className="text-gray-600">
                            {formatDate(submission.submittedAt)}
                          </Typography>
                        </Box>
                        
                        {submission.submittedAt && (
                          <Box className="flex items-center gap-2">
                            <GradeIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                            <Typography variant="body2" className="text-gray-600">
                              Puan: {submission.totalScore}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box className="flex items-center gap-3">
                    {getStatusChip(submission.submittedAt)}
                    
                    <Button
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewDetails(submission.id)}
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
                      Detay
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Box className="flex justify-center mt-8">
          <Pagination
            count={pagination.totalPages}
            page={pagination.pageNumber + 1}
            onChange={handlePageChange}
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

      {/* Summary */}
      {submissions.length > 0 && (
        <Box className="mt-6 p-4 bg-gray-50 rounded-xl">
          <Typography variant="body2" className="text-gray-600">
            Toplam <span className="font-semibold text-indigo-600">{pagination.totalElements}</span> sınav girişi bulundu
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default ExamSubmissionsPage;
