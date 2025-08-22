import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  Quiz as QuizIcon,
  School as SchoolIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { apiService } from '../utils/apiService';

const ExamSearchPage = () => {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  
  // Pagination and sorting
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0
  });
  const [sorting, setSorting] = useState({
    field: 'id',
    direction: 'desc'
  });

  const navigate = useNavigate();

  // Load courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Remove automatic search on filter changes
  // useEffect(() => {
  //   if (courses.length > 0) {
  //     fetchExams();
  //   }
  // }, [searchTerm, selectedCourseId, activeFilter, sorting, pagination.pageNumber]);

  const fetchCourses = async () => {
    try {
      const response = await apiService.get('/courses?page=0&size=100&sort=name,asc');
      setCourses(Array.isArray(response.content) ? response.content : []);
    } catch (err) {
      console.error('Kurslar yüklenirken hata:', err);
    }
  };

  const fetchExams = async (page = pagination.pageNumber, sortField = sorting.field, sortDirection = sorting.direction, search = searchTerm, courseId = selectedCourseId, active = activeFilter) => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        page: page.toString(),
        size: pagination.pageSize.toString(),
        sort: `${sortField},${sortDirection}`
      });

      // Add search filters
      if (search.trim()) {
        params.append('name', search.trim());
      }
      if (courseId) {
        params.append('courseId', courseId);
      }
      if (active !== '') {
        params.append('isActive', active);
      }
      
      const response = await apiService.get(`/exams?${params.toString()}`);
      
      setExams(Array.isArray(response.content) ? response.content : []);
      setPagination({
        pageNumber: response.pageNumber || 0,
        pageSize: response.pageSize || 10,
        totalElements: response.totalElements || 0,
        totalPages: response.totalPages || 0
      });
    } catch (err) {
      setError(err.message || 'Sınavlar yüklenirken bir hata oluştu');
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, newPage) => {
    const newPageNumber = newPage - 1;
    setPagination(prev => ({
      ...prev,
      pageNumber: newPageNumber
    }));
    // Perform search with new page
    fetchExams(newPageNumber, sorting.field, sorting.direction, searchTerm, selectedCourseId, activeFilter);
  };

  const handleSortChange = (event) => {
    const [field, direction] = event.target.value.split(',');
    setSorting({ field, direction });
    setPagination(prev => ({ ...prev, pageNumber: 0 }));
    // Don't trigger search automatically
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, pageNumber: 0 }));
    // Perform search immediately
    fetchExams();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCourseId('');
    setActiveFilter('');
    setSorting({ field: 'id', direction: 'desc' });
    setPagination(prev => ({ ...prev, pageNumber: 0 }));
    // Don't trigger search automatically
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours} saat ${remainingMinutes > 0 ? `${remainingMinutes} dakika` : ''}`;
    }
    return `${minutes} dakika`;
  };

  const handleExamClick = (examId) => {
    if (examId) {
      navigate(`/exam-detail/${examId}`);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box className="text-center mb-8">
        <Box className="bg-gradient-to-r from-orange-500 to-amber-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <QuizIcon sx={{ fontSize: 40, color: 'white' }} />
        </Box>
        <Typography variant="h4" className="font-bold text-gray-800 mb-2">
          Sınav Arama
        </Typography>
        <Typography variant="body1" className="text-gray-600">
          Tüm sınavları arayın, filtreleyin ve görüntüleyin
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 4, borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <CardContent sx={{ p: 4 }}>
          <Box className="space-y-4">
            {/* Search Bar */}
            <Box className="flex items-center gap-3">
              <TextField
                fullWidth
                placeholder="Sınav adı ile arayın..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#6b7280' }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearchTerm('')}
                        sx={{ color: '#6b7280' }}
                      >
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#f59e0b'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#d97706'
                    }
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                startIcon={<SearchIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                Ara
              </Button>
            </Box>

            {/* Filters */}
            <Box className="flex flex-wrap items-center gap-4">
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Kurs Seçin</InputLabel>
                <Select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  label="Kurs Seçin"
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="">Tüm Kurslar</MenuItem>
                  {courses.map((course) => (
                    <MenuItem key={course.id} value={course.id}>
                      {course.name} (Sınıf {course.gradeLevel})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Durum</InputLabel>
                <Select
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                  label="Durum"
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="true">Aktif</MenuItem>
                  <MenuItem value="false">Pasif</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel>Sıralama</InputLabel>
                <Select
                  value={`${sorting.field},${sorting.direction}`}
                  onChange={handleSortChange}
                  label="Sıralama"
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="id,desc">ID (Azalan)</MenuItem>
                  <MenuItem value="id,asc">ID (Artan)</MenuItem>
                  <MenuItem value="name,asc">Ad (A-Z)</MenuItem>
                  <MenuItem value="name,desc">Ad (Z-A)</MenuItem>
                  <MenuItem value="durationInMinutes,asc">Süre (Artan)</MenuItem>
                  <MenuItem value="durationInMinutes,desc">Süre (Azalan)</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                onClick={handleClearFilters}
                startIcon={<FilterIcon />}
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
                Filtreleri Temizle
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Results */}
      <Box className="space-y-4">
        {error && (
          <Alert severity="error" className="rounded-xl">
            {error}
          </Alert>
        )}

        {/* Results Summary */}
        <Box className="flex items-center justify-between">
          <Typography variant="h6" className="text-gray-800 font-semibold">
            Sonuçlar
          </Typography>
          <Typography variant="body2" className="text-gray-600">
            Toplam <span className="font-semibold text-orange-600">{pagination.totalElements}</span> sınav bulundu
          </Typography>
        </Box>

        {/* Loading */}
        {loading && (
          <Box className="flex justify-center items-center h-32">
            <CircularProgress size={48} sx={{ color: '#f59e0b' }} />
          </Box>
        )}

        {/* No Results */}
        {!loading && exams.length === 0 && (
          <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <CardContent sx={{ p: 6, textAlign: 'center' }}>
              <Box className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <QuizIcon sx={{ fontSize: 32, color: '#6b7280' }} />
              </Box>
              <Typography variant="h6" className="text-gray-600 mb-2">
                Sınav bulunamadı
              </Typography>
              <Typography variant="body2" className="text-gray-500">
                Arama kriterlerinize uygun sınav bulunamadı. Farklı filtreler deneyebilirsiniz.
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Exam Cards */}
        {!loading && exams.length > 0 && (
          <Grid container spacing={3}>
            {exams.map((exam) => (
              <Grid item xs={12} sm={6} lg={4} key={exam.id}>
                <Card
                  sx={{
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    }
                  }}
                  onClick={() => handleExamClick(exam.id)}
                >
                    <CardContent sx={{ p: 3 }}>
                      {/* Header */}
                      <Box className="flex items-start justify-between mb-3">
                        <Box className="bg-gradient-to-r from-orange-500 to-amber-600 w-12 h-12 rounded-full flex items-center justify-center">
                          <QuizIcon sx={{ fontSize: 24, color: 'white' }} />
                        </Box>
                        <Chip
                          icon={exam.active ? <CheckCircleIcon /> : <CancelIcon />}
                          label={exam.active ? 'Aktif' : 'Pasif'}
                          size="small"
                          sx={{
                            backgroundColor: exam.active ? '#dcfce7' : '#fef2f2',
                            color: exam.active ? '#166534' : '#dc2626',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}
                        />
                      </Box>

                      {/* Exam Info */}
                      <Box className="space-y-3">
                        <Typography variant="h6" className="font-bold text-gray-800 line-clamp-2">
                          {exam.name}
                        </Typography>

                        <Box className="flex items-center gap-2">
                          <SchoolIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                          <Typography variant="body2" className="text-gray-600">
                            {exam.courseName}
                          </Typography>
                        </Box>

                        <Box className="flex items-center gap-2">
                          <ScheduleIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                          <Typography variant="body2" className="text-gray-600">
                            {formatDuration(exam.durationInMinutes)}
                          </Typography>
                        </Box>

                        <Chip
                          label={`ID: ${exam.id}`}
                          size="small"
                          sx={{
                            backgroundColor: '#f0f9ff',
                            color: '#0369a1',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}
                        />

                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<VisibilityIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExamClick(exam.id);
                          }}
                          sx={{
                            borderColor: '#f59e0b',
                            color: '#f59e0b',
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 600,
                            mt: 2,
                            '&:hover': {
                              borderColor: '#d97706',
                              color: '#d97706',
                              backgroundColor: 'rgba(245, 158, 11, 0.04)'
                            }
                          }}
                        >
                          Detayları Görüntüle
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
            ))}
          </Grid>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
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
                  fontSize: '1rem',
                  '&.Mui-selected': {
                    backgroundColor: '#f59e0b',
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: '#d97706'
                    }
                  }
                }
              }}
            />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default ExamSearchPage;
