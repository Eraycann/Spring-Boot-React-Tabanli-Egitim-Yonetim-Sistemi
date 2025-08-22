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
  InputAdornment,
  Paper,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
  Fade,
  Zoom
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Grade as GradeIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Analytics as AnalyticsIcon,
  Refresh as RefreshIcon
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
    courseId: ''
  });
  const [sortBy, setSortBy] = useState('id,desc');
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchSubmissions();
  }, [pagination.pageNumber]);

  // Initial load
  useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    fetchExams();
    fetchCourses();
  }, []);

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

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, pageNumber: 0 }));
    fetchSubmissions();
  };

  const fetchExams = async () => {
    try {
      const response = await apiService.get('/exams?page=0&size=100&sort=name,asc');
      setExams(Array.isArray(response.content) ? response.content : []);
    } catch (err) {
      console.error('Sınavlar yüklenirken hata:', err);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await apiService.get('/courses?page=0&size=100&sort=name,asc');
      setCourses(Array.isArray(response.content) ? response.content : []);
    } catch (err) {
      console.error('Kurslar yüklenirken hata:', err);
    }
  };



  const handleSearchChange = (field, value) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
    setPagination(prev => ({ ...prev, pageNumber: 0 }));
  };

  const handleClearFilters = () => {
    setSearchParams({
      examId: '',
      courseId: ''
    });
    setSortBy('id,desc');
    setPagination(prev => ({ ...prev, pageNumber: 0 }));
    // Automatically search after clearing filters
    setTimeout(() => {
      fetchSubmissions();
    }, 100);
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
          icon={<CheckCircleIcon />}
          label="Tamamlandı"
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
        icon={<PendingIcon />}
        label="Devam Ediyor"
        size="small"
        sx={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: 'white',
          fontWeight: 600,
          fontSize: '0.75rem',
          boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
          '& .MuiChip-icon': {
            color: 'white',
            fontSize: '16px'
          }
        }}
      />
    );
  };

  const getSortIcon = () => {
    if (sortBy.includes('desc')) {
      return <TrendingDownIcon sx={{ fontSize: 16, color: '#6b7280' }} />;
    }
    return <TrendingUpIcon sx={{ fontSize: 16, color: '#6b7280' }} />;
  };

  if (loading && submissions.length === 0) {
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
              <AssignmentIcon sx={{ fontSize: 32, color: '#6366f1' }} />
            </Box>
          </Box>
          <Typography variant="h6" className="mt-6 text-gray-600 font-medium">
            Sınav girişleri yükleniyor...
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
            <AssignmentIcon sx={{ fontSize: 36, color: 'white' }} />
          </Box>
          <Typography 
            variant="h2" 
            className="font-bold text-gray-900 mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
          >
            Sınav Girişleri
          </Typography>
          <Typography variant="h6" className="text-gray-600 font-normal max-w-2xl mx-auto">
            Tüm sınav girişlerini görüntüleyin, analiz edin ve yönetin. 
            Öğrenci performanslarını takip edin ve detaylı raporlar alın.
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
                Toplam Giriş
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
                {submissions.filter(s => s.submittedAt).length}
              </Typography>
              <Typography variant="body2" className="opacity-90">
                Tamamlanan
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
                {submissions.filter(s => !s.submittedAt).length}
              </Typography>
              <Typography variant="body2" className="opacity-90">
                Devam Eden
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
                {submissions.length > 0 ? Math.round((submissions.filter(s => s.submittedAt).length / submissions.length) * 100) : 0}%
              </Typography>
              <Typography variant="body2" className="opacity-90">
                Tamamlanma Oranı
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Enhanced Search and Filter Section */}
      <Paper elevation={0} sx={{ 
        borderRadius: '24px', 
        border: '1px solid #e5e7eb',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        mb: 6,
        overflow: 'hidden'
      }}>
        <Box className="p-6 border-b border-gray-200">
          <Box className="flex items-center gap-3 mb-4">
            <Box className="bg-indigo-100 w-10 h-10 rounded-xl flex items-center justify-center">
              <FilterListIcon sx={{ fontSize: 20, color: '#6366f1' }} />
            </Box>
            <Typography variant="h5" className="font-semibold text-gray-900">
              Arama ve Filtreleme
            </Typography>
          </Box>
          <Typography variant="body2" className="text-gray-600">
            Sınav girişlerini sınav, kurs, öğrenci ve sıralama kriterlerine göre filtreleyin
          </Typography>
        </Box>
        
        <Box className="p-6">
          <Grid container spacing={3}>
            <Grid columns={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel 
                  sx={{ 
                    color: '#374151', 
                    fontWeight: 600,
                    backgroundColor: 'white',
                    padding: '0 8px',
                    '&.Mui-focused': {
                      color: '#6366f1',
                      backgroundColor: 'white'
                    }
                  }}
                >
                  Sınav Seçin
                </InputLabel>
                <Select
                  value={searchParams.examId}
                  onChange={(e) => handleSearchChange('examId', e.target.value)}
                  label="Sınav Seçin"
                  sx={{ 
                    borderRadius: '16px',
                    backgroundColor: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#d1d5db',
                      borderWidth: '2px'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#6366f1'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#6366f1',
                      borderWidth: '2px'
                    }
                  }}
                >
                  <MenuItem value="">Tüm Sınavlar</MenuItem>
                  {exams.map((exam) => (
                    <MenuItem key={exam.id} value={exam.id}>
                      {exam.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid columns={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel 
                  sx={{ 
                    color: '#374151', 
                    fontWeight: 600,
                    backgroundColor: 'white',
                    padding: '0 8px',
                    '&.Mui-focused': {
                      color: '#6366f1',
                      backgroundColor: 'white'
                    }
                  }}
                >
                  Kurs Seçin
                </InputLabel>
                <Select
                  value={searchParams.courseId}
                  onChange={(e) => handleSearchChange('courseId', e.target.value)}
                  label="Kurs Seçin"
                  sx={{ 
                    borderRadius: '16px',
                    backgroundColor: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#d1d5db',
                      borderWidth: '2px'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#6366f1'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#6366f1',
                      borderWidth: '2px'
                    }
                  }}
                >
                  <MenuItem value="">Tüm Kurslar</MenuItem>
                  {courses.map((course) => (
                    <MenuItem key={course.id} value={course.id}>
                      {course.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid columns={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel 
                  sx={{ 
                    color: '#374151', 
                    fontWeight: 600,
                    backgroundColor: 'white',
                    padding: '0 8px',
                    '&.Mui-focused': {
                      color: '#6366f1',
                      backgroundColor: 'white'
                    }
                  }}
                >
                  Sıralama
                </InputLabel>
                <Select
                  value={sortBy}
                  onChange={handleSortChange}
                  label="Sıralama"
                  startAdornment={
                    <InputAdornment position="start">
                      {getSortIcon()}
                    </InputAdornment>
                  }
                  sx={{ 
                    borderRadius: '16px',
                    backgroundColor: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#d1d5db',
                      borderWidth: '2px'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#6366f1'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#6366f1',
                      borderWidth: '2px'
                    }
                  }}
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
            
            <Grid columns={{ xs: 12, sm: 6, md: 3 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
                sx={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  borderRadius: '16px',
                  textTransform: 'none',
                  fontWeight: 600,
                  height: '56px',
                  fontSize: '1rem',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Ara
              </Button>
            </Grid>
          </Grid>
          
          {/* Clear Filters Button */}
          <Box className="flex justify-end mt-4">
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              sx={{
                borderColor: '#6b7280',
                color: '#6b7280',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                '&:hover': {
                  borderColor: '#374151',
                  color: '#374151',
                  backgroundColor: '#f3f4f6'
                }
              }}
            >
              Filtreleri Temizle
            </Button>
          </Box>
        </Box>
      </Paper>

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

      {/* Enhanced Submissions List */}
      {submissions.length === 0 ? (
        <Paper elevation={0} sx={{ 
          borderRadius: '24px', 
          border: '1px solid #e5e7eb',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
        }}>
          <Box className="p-12 text-center">
            <Box className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <AssignmentIcon sx={{ fontSize: 48, color: '#6b7280' }} />
            </Box>
            <Typography variant="h5" className="text-gray-700 mb-3 font-semibold">
              Sınav girişi bulunamadı
            </Typography>
            <Typography variant="body1" className="text-gray-500 max-w-md mx-auto">
              Arama kriterlerinize uygun sınav girişi bulunmuyor. 
              Farklı filtreler deneyebilir veya filtreleri temizleyebilirsiniz.
            </Typography>
          </Box>
        </Paper>
      ) : (
        <Stack spacing={4}>
          {submissions.map((submission, index) => (
            <Fade in={true} timeout={300 + (index * 100)} key={submission.id}>
              <Paper elevation={0} sx={{ 
                borderRadius: '24px',
                border: '1px solid #e5e7eb',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  borderColor: '#8b5cf6',
                  boxShadow: '0 20px 40px rgba(139, 92, 246, 0.15)',
                  transform: 'translateY(-4px)'
                }
              }}>
                {/* Gradient Border Effect */}
                <Box className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                
                <Box className="p-6">
                  <Box className="flex items-center justify-between">
                    <Box className="flex items-center gap-6">
                      {/* Avatar with Status */}
                      <Box className="relative">
                        <Avatar
                          sx={{
                            width: 64,
                            height: 64,
                            background: submission.submittedAt 
                              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                              : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            fontSize: '24px',
                            fontWeight: 'bold',
                            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
                          }}
                        >
                          {submission.studentName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${
                          submission.submittedAt ? 'bg-green-500' : 'bg-yellow-500'
                        }`} />
                      </Box>
                      
                      <Box className="flex-1">
                        <Typography variant="h5" className="font-bold text-gray-900 mb-2">
                          {submission.examName}
                        </Typography>
                        
                        <Box className="flex items-center gap-6 flex-wrap">
                          <Box className="flex items-center gap-2">
                            <PersonIcon sx={{ fontSize: 18, color: '#6b7280' }} />
                            <Typography variant="body1" className="text-gray-700 font-medium">
                              {submission.studentName}
                            </Typography>
                          </Box>
                          
                          <Box className="flex items-center gap-2">
                            <ScheduleIcon sx={{ fontSize: 18, color: '#6b7280' }} />
                            <Typography variant="body1" className="text-gray-600">
                              {formatDate(submission.submittedAt)}
                            </Typography>
                          </Box>
                          
                          {submission.submittedAt && (
                            <Box className="flex items-center gap-2">
                              <GradeIcon sx={{ fontSize: 18, color: '#6b7280' }} />
                              <Typography variant="body1" className="text-gray-700 font-semibold">
                                {submission.totalScore} puan
                              </Typography>
                            </Box>
                          )}
                          
                          <Box className="flex items-center gap-2">
                            <Typography variant="body2" className="text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                              ID: #{submission.id}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                    
                    <Box className="flex items-center gap-4">
                      {getStatusChip(submission.submittedAt)}
                      
                      <Tooltip title="Detayları Görüntüle" arrow>
                        <IconButton
                          onClick={() => handleViewDetails(submission.id)}
                          sx={{
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                            color: 'white',
                            width: 48,
                            height: 48,
                            boxShadow: '0 4px 14px rgba(139, 92, 246, 0.3)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                              transform: 'scale(1.05)',
                              boxShadow: '0 8px 25px rgba(139, 92, 246, 0.4)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
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
      {submissions.length > 0 && (
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
            Toplam <span className="font-bold text-yellow-300">{pagination.totalElements}</span> sınav girişi bulundu
            {' • '}
            <span className="font-bold text-green-300">
              {submissions.filter(s => s.submittedAt).length} tamamlandı
            </span>
            {' • '}
            <span className="font-bold text-orange-300">
              {submissions.filter(s => !s.submittedAt).length} devam ediyor
            </span>
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default ExamSubmissionsPage;
