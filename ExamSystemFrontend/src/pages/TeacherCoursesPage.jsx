import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Card, 
  CardContent, 
  Chip,
  CircularProgress,
  Alert,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import { 
  Book as BookIcon,
  Sort as SortIcon,
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { apiService } from '../utils/apiService';
import CourseEditModal from '../components/CourseEditModal';
import CourseDeleteModal from '../components/CourseDeleteModal';
import CourseDetailModal from '../components/CourseDetailModal';

const TeacherCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const fetchCourses = async (page = 0, sortField = sorting.field, sortDirection = sorting.direction) => {
    try {
      setLoading(true);
      setError('');
      
      // Always use teacher's own courses endpoint
      const response = await apiService.get(
        `/courses/teacher/me?page=${page}&size=${pagination.pageSize}&sort=${sortField},${sortDirection}`
      );
      
      setCourses(response.content || []);
      setPagination({
        pageNumber: response.pageNumber || 0,
        pageSize: response.pageSize || 10,
        totalElements: response.totalElements || 0,
        totalPages: response.totalPages || 0
      });
    } catch (err) {
      setError(err.message || 'Kurslar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handlePageChange = (event, newPage) => {
    fetchCourses(newPage - 1, sorting.field, sorting.direction);
  };

  const handleSortChange = (event) => {
    const [field, direction] = event.target.value.split(',');
    setSorting({ field, direction });
    fetchCourses(0, field, direction);
  };

  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setEditModalOpen(true);
  };

  const handleEditSuccess = (updatedCourse) => {
    // Update the course in the current list
    setCourses(prev => prev.map(course => 
      course.id === updatedCourse.id ? updatedCourse : course
    ));
  };

  const handleDeleteCourse = (course) => {
    setCourseToDelete(course);
    setDeleteModalOpen(true);
  };

  const handleDeleteSuccess = (deletedCourseId) => {
    // Remove the course from the current list
    setCourses(prev => prev.filter(course => course.id !== deletedCourseId));
  };

  const handleViewDetails = (courseId) => {
    setSelectedCourseId(courseId);
    setDetailModalOpen(true);
  };

  const handleFirstPage = () => {
    if (pagination.pageNumber > 0) {
      fetchCourses(0, sorting.field, sorting.direction);
    }
  };

  const handleLastPage = () => {
    if (pagination.pageNumber < pagination.totalPages - 1) {
      fetchCourses(pagination.totalPages - 1, sorting.field, sorting.direction);
    }
  };

  const handlePreviousPage = () => {
    if (pagination.pageNumber > 0) {
      fetchCourses(pagination.pageNumber - 1, sorting.field, sorting.direction);
    }
  };

  const handleNextPage = () => {
    if (pagination.pageNumber < pagination.totalPages - 1) {
      fetchCourses(pagination.pageNumber + 1, sorting.field, sorting.direction);
    }
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

  if (loading) {
    return (
      <Box className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <Box className="max-w-6xl mx-auto">
          <Box className="flex justify-center items-center h-64">
            <CircularProgress size={48} sx={{ color: '#3b82f6' }} />
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <Box className="max-w-6xl mx-auto">
        <Box className="mb-8 text-center">
          <Typography 
            variant="h3" 
            className="font-bold text-gray-800 mb-3"
            sx={{ 
              fontWeight: 800,
              background: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Kurslarım
          </Typography>
          <Typography variant="h6" className="text-gray-600 font-medium">
            Verdiğiniz derslerin listesi
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" className="mb-6 rounded-xl shadow-sm">
            {error}
          </Alert>
        )}

        {/* Sorting Controls */}
        <Box className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Box className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100">
            <SortIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
            <Typography variant="body1" className="text-gray-700 font-medium">
              Sıralama:
            </Typography>
            
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <Select
                value={`${sorting.field},${sorting.direction}`}
                onChange={handleSortChange}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none'
                  },
                  '& .MuiSelect-select': {
                    fontWeight: 500,
                    color: '#1e293b'
                  }
                }}
              >
                <MenuItem value="id,desc">Kurs ID (Azalan)</MenuItem>
                <MenuItem value="id,asc">Kurs ID (Artan)</MenuItem>
                <MenuItem value="name,asc">Kurs Adı (A-Z)</MenuItem>
                <MenuItem value="name,desc">Kurs Adı (Z-A)</MenuItem>
                <MenuItem value="gradeLevel,asc">Sınıf Seviyesi (Artan)</MenuItem>
                <MenuItem value="gradeLevel,desc">Sınıf Seviyesi (Azalan)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {courses.length === 0 && !loading ? (
          <Paper 
            elevation={0}
            className="p-16 rounded-3xl border border-gray-200 text-center shadow-lg"
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Box className="bg-gradient-to-br from-blue-100 to-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookIcon sx={{ fontSize: 48, color: '#3b82f6' }} />
            </Box>
            <Typography variant="h5" className="text-gray-700 mb-3 font-semibold">
              Henüz kurs oluşturmadınız
            </Typography>
            <Typography variant="body1" className="text-gray-500 max-w-md mx-auto">
              İlk kursunuzu oluşturmak için "Kurs Oluştur" sayfasını ziyaret edin
            </Typography>
          </Paper>
        ) : (
          <>
            <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {courses.map((course) => {
                const gradeColor = getGradeLevelColor(course.gradeLevel);
                return (
                  <Card 
                    key={course.id}
                    elevation={0}
                    className="h-full hover:scale-105 transition-all duration-300 cursor-pointer group"
                    onClick={() => handleViewDetails(course.id)}
                    sx={{ 
                      border: '2px solid transparent',
                      borderRadius: '20px',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      '&:hover': {
                        borderColor: gradeColor.border,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.1)',
                        transform: 'translateY(-8px) scale(1.02)',
                        '& .course-icon': {
                          transform: 'scale(1.1) rotate(5deg)',
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                        }
                      },
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    <CardContent className="p-8">
                       <Box className="flex items-start justify-between mb-6">
                         <Box className="relative">
                           <Box className="course-icon bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg">
                             <BookIcon sx={{ fontSize: 28, color: 'white' }} />
                             <Box className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                               <Typography variant="caption" sx={{ color: 'white', fontWeight: 700, fontSize: '0.7rem' }}>
                                 {course.id}
                               </Typography>
                             </Box>
                           </Box>
                         </Box>
                         <Box className="flex items-center gap-2">
                           <Chip 
                             label={getGradeLevelText(course.gradeLevel)}
                             size="medium"
                             sx={{
                               backgroundColor: gradeColor.bg,
                               color: gradeColor.color,
                               fontWeight: 700,
                               fontSize: '0.875rem',
                               borderRadius: '12px',
                               border: `2px solid ${gradeColor.border}`,
                               '&:hover': {
                                 backgroundColor: gradeColor.bg,
                                 transform: 'scale(1.05)'
                               }
                             }}
                           />
                           <IconButton
                             onClick={(e) => {
                               e.stopPropagation();
                               handleEditCourse(course);
                             }}
                             size="small"
                             sx={{
                               background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                               color: 'white',
                               width: 36,
                               height: 36,
                               boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                               '&:hover': {
                                 background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                                 transform: 'scale(1.1) rotate(5deg)',
                                 boxShadow: '0 8px 20px rgba(59, 130, 246, 0.4)'
                               },
                               transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                             }}
                           >
                             <EditIcon sx={{ fontSize: 16 }} />
                           </IconButton>
                           <IconButton
                             onClick={(e) => {
                               e.stopPropagation();
                               handleDeleteCourse(course);
                             }}
                             size="small"
                             sx={{
                               background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                               color: 'white',
                               width: 36,
                               height: 36,
                               boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                               '&:hover': {
                                 background: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
                                 transform: 'scale(1.1) rotate(-5deg)',
                                 boxShadow: '0 8px 20px rgba(220, 38, 38, 0.4)'
                               },
                               transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                             }}
                           >
                             <DeleteIcon sx={{ fontSize: 16 }} />
                           </IconButton>
                         </Box>
                       </Box>
                       
                      <Typography 
                        variant="h5" 
                        className="font-bold text-gray-800 mb-3"
                        sx={{ 
                          fontWeight: 800,
                          lineHeight: 1.2,
                          background: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {course.name}
                      </Typography>
                      
                      <Typography 
                        variant="body2" 
                        className="text-gray-500 mb-4 font-medium"
                      >
                        Kurs ID: #{course.id}
                      </Typography>
                      
                      <Box className="pt-4 border-t border-gray-100">
                        <Typography 
                          variant="body2" 
                          className="text-gray-600 font-medium"
                        >
                          Öğretmen: {course.teacherFirstName} {course.teacherLastName}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <Box className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <Typography variant="body1" className="text-gray-700 font-medium">
                  Toplam <span className="text-blue-600 font-bold">{pagination.totalElements}</span> kurs, 
                  <span className="text-blue-600 font-bold ml-1">{pagination.totalPages}</span> sayfa
                </Typography>
                
                <Box className="flex items-center gap-3">
                  <IconButton
                    onClick={handleFirstPage}
                    disabled={pagination.pageNumber === 0}
                    size="medium"
                    sx={{ 
                      color: '#6b7280',
                      '&:hover': { backgroundColor: '#eff6ff', color: '#3b82f6' },
                      '&.Mui-disabled': { color: '#d1d5db' }
                    }}
                  >
                    <FirstPageIcon />
                  </IconButton>
                  
                  <IconButton
                    onClick={handlePreviousPage}
                    disabled={pagination.pageNumber === 0}
                    size="medium"
                    sx={{ 
                      color: '#6b7280',
                      '&:hover': { backgroundColor: '#eff6ff', color: '#3b82f6' },
                      '&.Mui-disabled': { color: '#d1d5db' }
                    }}
                  >
                    <NavigateBeforeIcon />
                  </IconButton>
                  
                  <Pagination
                    count={pagination.totalPages}
                    page={pagination.pageNumber + 1}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    sx={{
                      '& .MuiPaginationItem-root': {
                        borderRadius: '12px',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        '&.Mui-selected': {
                          backgroundColor: '#3b82f6',
                          color: '#ffffff',
                          '&:hover': {
                            backgroundColor: '#2563eb'
                          }
                        }
                      }
                    }}
                  />
                  
                  <IconButton
                    onClick={handleNextPage}
                    disabled={pagination.pageNumber === pagination.totalPages - 1}
                    size="medium"
                    sx={{ 
                      color: '#6b7280',
                      '&:hover': { backgroundColor: '#eff6ff', color: '#3b82f6' },
                      '&.Mui-disabled': { color: '#d1d5db' }
                    }}
                  >
                    <NavigateNextIcon />
                  </IconButton>
                  
                  <IconButton
                    onClick={handleLastPage}
                    disabled={pagination.pageNumber === pagination.totalPages - 1}
                    size="medium"
                    sx={{ 
                      color: '#6b7280',
                      '&:hover': { backgroundColor: '#eff6ff', color: '#3b82f6' },
                      '&.Mui-disabled': { color: '#d1d5db' }
                    }}
                  >
                    <LastPageIcon />
                  </IconButton>
                </Box>
              </Box>
            )}
          </>
        )}
      </Box>
      
      {/* Course Edit Modal */}
      <CourseEditModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedCourse(null);
        }}
        course={selectedCourse}
        onSuccess={handleEditSuccess}
      />
      
      {/* Course Delete Modal */}
      <CourseDeleteModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setCourseToDelete(null);
        }}
        course={courseToDelete}
        onSuccess={handleDeleteSuccess}
      />
      
      {/* Course Detail Modal */}
      <CourseDetailModal
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedCourseId(null);
        }}
        courseId={selectedCourseId}
      />
    </Box>
  );
};

export default TeacherCoursesPage;
