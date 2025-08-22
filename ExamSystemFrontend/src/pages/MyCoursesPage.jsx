import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Alert,
  CircularProgress,
  Grid,
  Divider,
  Paper
} from '@mui/material';
import {
  School as SchoolIcon,
  Sort as SortIcon,
  Book as BookIcon,
  Visibility as VisibilityIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { apiService } from '../utils/apiService';
import { useAuth } from '../hooks/useAuth';
import CourseDetailModal from '../components/CourseDetailModal';

const MyCoursesPage = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 8,
    totalElements: 0,
    totalPages: 0
  });
  const [sorting, setSorting] = useState({
    field: 'course.id',
    direction: 'desc'
  });
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, [pagination.pageNumber, sorting]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        page: pagination.pageNumber.toString(),
        size: pagination.pageSize.toString(),
        sort: `${sorting.field},${sorting.direction}`
      });
      
      const response = await apiService.get(`/course-students/me/enrolled-courses?${params.toString()}`);
      
      setCourses(Array.isArray(response.content) ? response.content : []);
      setPagination({
        pageNumber: response.pageNumber || 0,
        pageSize: response.pageSize || 8,
        totalElements: response.totalElements || 0,
        totalPages: response.totalPages || 0
      });
    } catch (err) {
      setError(err.message || 'Kurslarınız yüklenirken bir hata oluştu');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, pageNumber: newPage - 1 }));
  };

  const handleSortChange = (event) => {
    const [field, direction] = event.target.value.split(',');
    setSorting({ field, direction });
    setPagination(prev => ({ ...prev, pageNumber: 0 }));
  };

  const handleViewCourse = (courseId) => {
    setSelectedCourseId(courseId);
    setDetailModalOpen(true);
  };

  const getGradeLevelText = (gradeLevel) => {
    switch (gradeLevel) {
      case 9: return '9. Sınıf';
      case 10: return '10. Sınıf';
      case 11: return '11. Sınıf';
      case 12: return '12. Sınıf';
      default: return `${gradeLevel}. Sınıf`;
    }
  };

  const getGradeLevelColor = (gradeLevel) => {
    switch (gradeLevel) {
      case 9: return { bg: '#fef3c7', color: '#92400e', border: '#f59e0b' };
      case 10: return { bg: '#dbeafe', color: '#1e40af', border: '#3b82f6' };
      case 11: return { bg: '#dcfce7', color: '#166534', border: '#22c55e' };
      case 12: return { bg: '#fce7f3', color: '#be185d', border: '#ec4899' };
      default: return { bg: '#f3f4f6', color: '#374151', border: '#6b7280' };
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box className="mb-8">
        <Box className="text-center mb-6">
          <Box className="bg-gradient-to-r from-purple-600 to-indigo-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <SchoolIcon sx={{ fontSize: 40, color: 'white' }} />
          </Box>
          <Typography variant="h3" className="font-bold text-gray-800 mb-2">
            Kurslarım
          </Typography>
          <Typography variant="h6" className="text-gray-600 max-w-2xl mx-auto">
            Kayıtlı olduğunuz kursları görüntüleyin ve yönetin
          </Typography>
        </Box>

        {/* User Info Card */}
        <Card sx={{ 
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          mb: 4
        }}>
          <CardContent className="p-6">
            <Box className="flex items-center gap-4">
              <Avatar
                sx={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  width: 56,
                  height: 56,
                  fontSize: '1.5rem',
                  fontWeight: 600
                }}
              >
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </Avatar>
              <Box className="flex-1">
                <Typography variant="h5" className="font-bold text-gray-800 mb-1">
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="body1" className="text-gray-600">
                  Öğrenci • {user?.email}
                </Typography>
              </Box>
              <Chip
                label={`${pagination.totalElements} Kurs`}
                size="large"
                sx={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '1rem',
                  height: 40
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Controls Section */}
      <Paper 
        elevation={0}
        sx={{ 
          borderRadius: '16px', 
          border: '1px solid #e2e8f0',
          mb: 4,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
        }}
      >
        <Box className="p-6">
          <Box className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Results Info */}
            <Box className="flex items-center gap-2">
              <DashboardIcon sx={{ color: '#8b5cf6', fontSize: 24 }} />
              <Typography variant="h6" className="font-semibold text-gray-800">
                Kurslarım
              </Typography>
              <Chip
                label={`${pagination.totalElements} kurs`}
                size="small"
                sx={{
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.75rem'
                }}
              />
            </Box>

            {/* Sort Control */}
            <Box className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
              <SortIcon sx={{ color: '#8b5cf6', fontSize: 20 }} />
              <Typography variant="body2" className="text-gray-700 font-medium">
                Sırala:
              </Typography>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <Select
                  value={`${sorting.field},${sorting.direction}`}
                  onChange={handleSortChange}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none'
                    },
                    '& .MuiSelect-select': {
                      fontWeight: 500,
                      color: '#1e293b',
                      fontSize: '0.875rem'
                    }
                  }}
                >
                  <MenuItem value="course.id,desc">En Yeni</MenuItem>
                  <MenuItem value="course.id,asc">En Eski</MenuItem>
                  <MenuItem value="course.name,asc">Ad (A-Z)</MenuItem>
                  <MenuItem value="course.name,desc">Ad (Z-A)</MenuItem>
                  <MenuItem value="course.gradeLevel,asc">Sınıf (Artan)</MenuItem>
                  <MenuItem value="course.gradeLevel,desc">Sınıf (Azalan)</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" className="mb-4 rounded-xl">
          {error}
        </Alert>
      )}

      {/* Courses Grid */}
      {loading ? (
        <Box className="flex justify-center items-center h-64">
          <CircularProgress size={64} sx={{ color: '#8b5cf6' }} />
        </Box>
      ) : courses.length === 0 ? (
        <Card sx={{ borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <CardContent className="p-12 text-center">
            <Box className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookIcon sx={{ fontSize: 40, color: '#6b7280' }} />
            </Box>
            <Typography variant="h5" className="text-gray-600 mb-2">
              Henüz kurs kaydınız yok
            </Typography>
            <Typography variant="body1" className="text-gray-500">
              Kurslara kayıt olmak için öğretmeninizle iletişime geçin
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Courses Grid */}
          <Grid container spacing={3}>
            {courses.map((course) => (
              <Grid 
                key={course.id}
                columns={{ xs: 12, sm: 6, lg: 4, xl: 3 }}
              >
                <Card
                  sx={{
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    height: '100%',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                      borderColor: '#8b5cf6',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)'
                    }
                  }}
                  onClick={() => handleViewCourse(course.id)}
                >
                  <CardContent className="p-6">
                    {/* Course Header */}
                    <Box className="flex items-start justify-between mb-4">
                      <Box className="bg-gradient-to-br from-purple-500 to-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">
                        <BookIcon sx={{ fontSize: 24, color: 'white' }} />
                      </Box>
                      <Chip
                        label={getGradeLevelText(course.gradeLevel)}
                        size="small"
                        sx={{
                          backgroundColor: getGradeLevelColor(course.gradeLevel).bg,
                          color: getGradeLevelColor(course.gradeLevel).color,
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          border: `1px solid ${getGradeLevelColor(course.gradeLevel).border}`
                        }}
                      />
                    </Box>

                    {/* Course Info */}
                    <Typography variant="h6" className="font-bold text-gray-800 mb-2 line-clamp-2">
                      {course.name}
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />

                    {/* Teacher Info */}
                    <Box className="flex items-center gap-2 mb-3">
                      <Avatar
                        sx={{
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          width: 32,
                          height: 32,
                          fontSize: '0.875rem'
                        }}
                      >
                        {course.teacherFirstName?.charAt(0)}{course.teacherLastName?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" className="text-gray-600 font-medium">
                          {course.teacherFirstName} {course.teacherLastName}
                        </Typography>
                        <Typography variant="caption" className="text-gray-500">
                          Öğretmen
                        </Typography>
                      </Box>
                    </Box>

                    {/* Course ID */}
                    <Typography variant="body2" className="text-gray-500 mb-4">
                      Kurs ID: #{course.id}
                    </Typography>
                  </CardContent>

                  <CardActions className="p-6 pt-0">
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<VisibilityIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewCourse(course.id);
                      }}
                      sx={{
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                          boxShadow: '0 6px 16px rgba(139, 92, 246, 0.4)'
                        }
                      }}
                    >
                      Kursu Görüntüle
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

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
                    fontSize: '1rem',
                    '&.Mui-selected': {
                      backgroundColor: '#8b5cf6',
                      color: '#ffffff',
                      '&:hover': {
                        backgroundColor: '#7c3aed'
                      }
                    }
                  }
                }}
              />
            </Box>
          )}
        </>
      )}

      {/* Course Detail Modal */}
      <CourseDetailModal
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedCourseId(null);
        }}
        courseId={selectedCourseId}
      />
    </Container>
  );
};

export default MyCoursesPage;
