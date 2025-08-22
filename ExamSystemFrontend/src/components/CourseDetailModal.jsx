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
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { 
  Close as CloseIcon,
  Book as BookIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
  Sort as SortIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  People as PeopleIcon,
  Quiz as QuizIcon
} from '@mui/icons-material';
import { apiService } from '../utils/apiService';
import TopicAddModal from './TopicAddModal';
import TopicEditModal from './TopicEditModal';
import TopicDeleteModal from './TopicDeleteModal';
import CourseStudentsModal from './CourseStudentsModal';
import CourseExamsModal from './CourseExamsModal';
import { useAuth } from '../hooks/useAuth';

const CourseDetailModal = ({ open, onClose, courseId }) => {
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [topicsPagination, setTopicsPagination] = useState({
    pageNumber: 0,
    pageSize: 5,
    totalElements: 0,
    totalPages: 0
  });
  const [topicsSorting, setTopicsSorting] = useState({
    field: 'id',
    direction: 'desc'
  });
  const [addTopicModalOpen, setAddTopicModalOpen] = useState(false);
  const [editTopicModalOpen, setEditTopicModalOpen] = useState(false);
  const [deleteTopicModalOpen, setDeleteTopicModalOpen] = useState(false);
  const [courseStudentsModalOpen, setCourseStudentsModalOpen] = useState(false);
  const [courseExamsModalOpen, setCourseExamsModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topicSearchFilter, setTopicSearchFilter] = useState('');

  useEffect(() => {
    if (open && courseId) {
      fetchCourseDetails();
      fetchTopics();
    }
  }, [open, courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.get(`/courses/${courseId}`);
      setCourse(response);
    } catch (err) {
      setError(err.message || 'Kurs detayları yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async (page = 0, sortField = topicsSorting.field, sortDirection = topicsSorting.direction, searchName = topicSearchFilter) => {
    try {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        size: topicsPagination.pageSize.toString(),
        sort: `${sortField},${sortDirection}`,
        courseId: courseId.toString()
      });

      // Add name filter if provided
      if (searchName && searchName.trim()) {
        searchParams.append('name', searchName.trim());
      }
      
      const response = await apiService.get(`/topics?${searchParams.toString()}`);
      
      setTopics(Array.isArray(response.content) ? response.content : []);
      setTopicsPagination({
        pageNumber: response.pageNumber || 0,
        pageSize: response.pageSize || 5,
        totalElements: response.totalElements || 0,
        totalPages: response.totalPages || 0
      });
    } catch (err) {
      console.error('Konular yüklenirken hata:', err);
      setTopics([]);
      setTopicsPagination({
        pageNumber: 0,
        pageSize: 5,
        totalElements: 0,
        totalPages: 0
      });
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

  const handleClose = () => {
    setCourse(null);
    setTopics([]);
    setError('');
    setTopicSearchFilter('');
    onClose();
  };

  const handleTopicsPageChange = (event, newPage) => {
    fetchTopics(newPage - 1, topicsSorting.field, topicsSorting.direction, topicSearchFilter);
  };

  const handleTopicsSortChange = (event) => {
    const [field, direction] = event.target.value.split(',');
    setTopicsSorting({ field, direction });
    fetchTopics(0, field, direction, topicSearchFilter);
  };

  const handleTopicSearchChange = (event) => {
    const value = event.target.value;
    setTopicSearchFilter(value);
    
    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      fetchTopics(0, topicsSorting.field, topicsSorting.direction, value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleClearTopicSearch = () => {
    setTopicSearchFilter('');
    fetchTopics(0, topicsSorting.field, topicsSorting.direction, '');
  };

  const handleAddTopicSuccess = (newTopic) => {
    // Refresh topics list to show the new topic
    fetchTopics(topicsPagination.pageNumber, topicsSorting.field, topicsSorting.direction, topicSearchFilter);
  };

  const handleEditTopic = (topic) => {
    setSelectedTopic(topic);
    setEditTopicModalOpen(true);
  };

  const handleEditTopicSuccess = (updatedTopic) => {
    // Refresh topics list to show the updated topic
    fetchTopics(topicsPagination.pageNumber, topicsSorting.field, topicsSorting.direction, topicSearchFilter);
  };

  const handleDeleteTopic = (topic) => {
    setSelectedTopic(topic);
    setDeleteTopicModalOpen(true);
  };

  const handleDeleteTopicSuccess = (deletedTopicId) => {
    // Refresh topics list to show the updated list after deletion
    fetchTopics(topicsPagination.pageNumber, topicsSorting.field, topicsSorting.direction, topicSearchFilter);
  };

  if (!courseId) return null;

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          background: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)',
          color: 'white',
          borderRadius: '20px 20px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box className="flex items-center gap-2">
            <BookIcon />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Kurs Detayları
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          {error && (
            <Alert severity="error" className="mb-4 rounded-xl">
              {error}
            </Alert>
          )}
          
          {loading ? (
            <Box className="flex justify-center items-center h-32">
              <CircularProgress size={48} sx={{ color: '#3b82f6' }} />
            </Box>
          ) : course ? (
            <Box className="space-y-6">
              {/* Course Header */}
              <Box className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-2xl border border-blue-200">
                <Box className="flex items-start justify-between mb-4">
                  <Box className="flex items-center gap-4">
                    <Box className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg">
                      <BookIcon sx={{ fontSize: 32, color: 'white' }} />
                    </Box>
                    <Box>
                      <Typography variant="h4" className="font-bold text-gray-800 mb-2">
                        {course.name}
                      </Typography>
                      <Typography variant="body1" className="text-gray-600">
                        Kurs ID: #{course.id}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip 
                    label={getGradeLevelText(course.gradeLevel)}
                    size="large"
                    sx={{
                      backgroundColor: getGradeLevelColor(course.gradeLevel).bg,
                      color: getGradeLevelColor(course.gradeLevel).color,
                      fontWeight: 700,
                      fontSize: '1rem',
                      borderRadius: '12px',
                      border: `2px solid ${getGradeLevelColor(course.gradeLevel).border}`,
                      height: 40
                    }}
                  />
                  <Box className="flex items-center gap-2">
                    <Button
                      variant="outlined"
                      startIcon={<PeopleIcon />}
                      onClick={() => setCourseStudentsModalOpen(true)}
                      sx={{
                        borderColor: '#3b82f6',
                        color: '#3b82f6',
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                          backgroundColor: '#e0f2fe',
                          borderColor: '#1d4ed8',
                          color: '#1d4ed8',
                        },
                      }}
                    >
                      Öğrenci Listesi
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<QuizIcon />}
                      onClick={() => setCourseExamsModalOpen(true)}
                      sx={{
                        borderColor: '#f59e0b',
                        color: '#f59e0b',
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                          backgroundColor: '#fef3c7',
                          borderColor: '#d97706',
                          color: '#d97706',
                        },
                      }}
                    >
                      Sınav Listesi
                    </Button>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 3 }} />
                
                <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Box className="bg-white p-4 rounded-xl border border-blue-200">
                    <Typography variant="h6" className="text-gray-800 font-semibold mb-2 flex items-center gap-2">
                      <SchoolIcon sx={{ color: '#3b82f6' }} />
                      Öğretmen Bilgileri
                    </Typography>
                    <Typography variant="body1" className="text-gray-700">
                      {course.teacherFirstName} {course.teacherLastName}
                    </Typography>
                    <Typography variant="body2" className="text-gray-500 mt-1">
                      Öğretmen ID: {course.teacherId}
                    </Typography>
                  </Box>
                  
                  <Box className="bg-white p-4 rounded-xl border border-blue-200">
                    <Typography variant="h6" className="text-gray-800 font-semibold mb-2">
                      Kurs İstatistikleri
                    </Typography>
                    <Typography variant="body1" className="text-gray-700">
                      Toplam Konu: {topicsPagination.totalElements}
                    </Typography>
                    <Typography variant="body2" className="text-gray-500 mt-1">
                      Sınıf Seviyesi: {getGradeLevelText(course.gradeLevel)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Topics Section */}
              <Box className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <Box className="bg-gradient-to-r from-green-500 to-emerald-600 p-4">
                  <Box className="flex items-center justify-between">
                    <Typography variant="h6" className="text-white font-semibold">
                      Kurs Konuları
                    </Typography>
                    <Box className="flex items-center gap-3">
                      {/* Search Input */}
                      <Box className="flex items-center gap-2 bg-white bg-opacity-20 px-3 py-1 rounded-lg">
                        <SearchIcon sx={{ color: 'white', fontSize: 18 }} />
                        <input
                          type="text"
                          placeholder="Konu ara..."
                          value={topicSearchFilter}
                          onChange={handleTopicSearchChange}
                          className="bg-transparent text-white placeholder-white placeholder-opacity-70 outline-none border-none text-sm min-w-[150px]"
                          style={{ color: 'white' }}
                        />
                        {topicSearchFilter && (
                          <IconButton
                            size="small"
                            onClick={handleClearTopicSearch}
                            sx={{ 
                              color: 'white', 
                              padding: '2px',
                              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
                            }}
                          >
                            <ClearIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        )}
                      </Box>
                      
                      {/* Sorting Control */}
                      <Box className="flex items-center gap-2 bg-white bg-opacity-20 px-3 py-1 rounded-lg">
                        <SortIcon sx={{ color: 'white', fontSize: 18 }} />
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={`${topicsSorting.field},${topicsSorting.direction}`}
                            onChange={handleTopicsSortChange}
                            sx={{
                              color: 'white',
                              '& .MuiSelect-icon': { color: 'white' },
                              '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                              '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' }
                            }}
                          >
                            <MenuItem value="id,desc">ID (Azalan)</MenuItem>
                            <MenuItem value="id,asc">ID (Artan)</MenuItem>
                            <MenuItem value="name,asc">Ad (A-Z)</MenuItem>
                            <MenuItem value="name,desc">Ad (Z-A)</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                      
                      {/* Add Topic Button */}
                             {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_TEACHER') && (
         <Button
           variant="contained"
           startIcon={<AddIcon />}
           onClick={() => setAddTopicModalOpen(true)}
           sx={{
             backgroundColor: 'rgba(255, 255, 255, 0.2)',
             color: 'white',
             borderRadius: '12px',
             textTransform: 'none',
             fontWeight: 600,
             '&:hover': {
               backgroundColor: 'rgba(255, 255, 255, 0.3)',
             },
           }}
         >
           Konu Ekle
         </Button>
       )}
                    </Box>
                  </Box>
                </Box>
                
                <Box className="p-4">
                  {topicsPagination.totalElements === 0 ? (
                    <Box className="text-center py-8">
                      <Box className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookIcon sx={{ fontSize: 32, color: '#6b7280' }} />
                      </Box>
                      <Typography variant="h6" className="text-gray-600 mb-2">
                        {topicSearchFilter ? 'Arama sonucu bulunamadı' : 'Henüz konu eklenmemiş'}
                      </Typography>
                      <Typography variant="body2" className="text-gray-500">
                        {topicSearchFilter 
                          ? `"${topicSearchFilter}" araması için sonuç bulunamadı. Farklı bir arama terimi deneyin.`
                          : 'Bu kursa konu eklemek için "Konu Ekle" butonunu kullanın'
                        }
                      </Typography>
                    </Box>
                  ) : (
                    <List>
                      {(Array.isArray(topics) ? topics : []).map((topic, index) => (
                        <ListItem
                          key={topic.id || index}
                          sx={{
                            border: '1px solid #f1f5f9',
                            borderRadius: '16px',
                            mb: 3,
                            backgroundColor: '#ffffff',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                            '&:hover': {
                              borderColor: '#10b981',
                              backgroundColor: '#f8fafc',
                              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                              transform: 'translateY(-2px)'
                            },
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}
                        >
                          <Box className="flex items-center gap-4 w-full">
                            {/* Topic Icon */}
                            <Box className="bg-gradient-to-br from-green-500 to-emerald-600 w-12 h-12 rounded-xl flex items-center justify-center shadow-md">
                              <BookIcon sx={{ fontSize: 20, color: 'white' }} />
                            </Box>
                            
                            {/* Topic Content */}
                            <Box className="flex-1 min-w-0">
                              <Typography 
                                variant="h6" 
                                className="font-bold text-gray-800 mb-1"
                                sx={{ 
                                  fontSize: '1.1rem',
                                  fontWeight: 700,
                                  lineHeight: 1.3
                                }}
                              >
                                {topic.name || `Konu ${index + 1}`}
                              </Typography>
                              <Box className="flex items-center gap-3">
                                <Box className="flex items-center gap-1">
                                  <Box className="w-2 h-2 bg-green-500 rounded-full"></Box>
                                  <Typography 
                                    variant="body2" 
                                    className="text-gray-500 font-medium"
                                    sx={{ fontSize: '0.875rem' }}
                                  >
                                    #{topic.id}
                                  </Typography>
                                </Box>
                                <Box className="w-1 h-1 bg-gray-300 rounded-full"></Box>
                                <Typography 
                                  variant="body2" 
                                  className="text-gray-400 font-medium"
                                  sx={{ fontSize: '0.875rem' }}
                                >
                                  {topic.courseName}
                                </Typography>
                              </Box>
                            </Box>
                            
                            {/* Action Buttons */}
                            <Box className="flex items-center gap-1">
                                       {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_TEACHER') && (
           <>
             <IconButton
               size="small"
               onClick={() => handleEditTopic(topic)}
               sx={{
                 background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                 color: 'white',
                 width: 32,
                 height: 32,
                 boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
                 '&:hover': {
                   background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                   transform: 'scale(1.1)',
                   boxShadow: '0 4px 8px rgba(59, 130, 246, 0.4)'
                 },
                 transition: 'all 0.2s ease'
               }}
             >
               <EditIcon sx={{ fontSize: 14 }} />
             </IconButton>
             <IconButton
               size="small"
               onClick={() => handleDeleteTopic(topic)}
               sx={{
                 background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                 color: 'white',
                 width: 32,
                 height: 32,
                 boxShadow: '0 2px 4px rgba(220, 38, 38, 0.3)',
                 '&:hover': {
                   background: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
                   transform: 'scale(1.1)',
                   boxShadow: '0 4px 8px rgba(220, 38, 38, 0.4)'
                 },
                 transition: 'all 0.2s ease'
               }}
             >
               <DeleteIcon sx={{ fontSize: 14 }} />
             </IconButton>
           </>
         )}
                            </Box>
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
                
                {/* Topics Pagination */}
                {topicsPagination.totalPages > 1 && (
                  <Box className="bg-gray-50 p-4 border-t border-gray-200">
                    <Box className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <Typography variant="body2" className="text-gray-600">
                        {topicSearchFilter ? (
                          <>
                            <span className="font-semibold text-green-600">"{topicSearchFilter}"</span> araması için{' '}
                            <span className="font-semibold text-green-600">{topicsPagination.totalElements}</span> sonuç,{' '}
                            <span className="font-semibold text-green-600">{topicsPagination.totalPages}</span> sayfa
                          </>
                        ) : (
                          <>
                            Toplam <span className="font-semibold text-green-600">{topicsPagination.totalElements}</span> konu,{' '}
                            <span className="font-semibold text-green-600">{topicsPagination.totalPages}</span> sayfa
                          </>
                        )}
                      </Typography>
                      
                      <Pagination
                        count={topicsPagination.totalPages}
                        page={topicsPagination.pageNumber + 1}
                        onChange={handleTopicsPageChange}
                        color="primary"
                        size="medium"
                        sx={{
                          '& .MuiPaginationItem-root': {
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            '&.Mui-selected': {
                              backgroundColor: '#10b981',
                              color: '#ffffff',
                              '&:hover': {
                                backgroundColor: '#059669'
                              }
                            }
                          }
                        }}
                      />
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          ) : null}
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
            Kapat
          </Button>
        </DialogActions>
      </Dialog>

      {/* Topic Add Modal */}
      <TopicAddModal
        open={addTopicModalOpen}
        onClose={() => setAddTopicModalOpen(false)}
        courseId={courseId}
        courseName={course?.name}
        onSuccess={handleAddTopicSuccess}
      />

      {/* Topic Edit Modal */}
      <TopicEditModal
        open={editTopicModalOpen}
        onClose={() => {
          setEditTopicModalOpen(false);
          setSelectedTopic(null);
        }}
        topic={selectedTopic}
        onSuccess={handleEditTopicSuccess}
      />

      {/* Topic Delete Modal */}
      <TopicDeleteModal
        open={deleteTopicModalOpen}
        onClose={() => {
          setDeleteTopicModalOpen(false);
          setSelectedTopic(null);
        }}
        topic={selectedTopic}
        onSuccess={handleDeleteTopicSuccess}
      />

      {/* Course Students Modal */}
      <CourseStudentsModal
        open={courseStudentsModalOpen}
        onClose={() => setCourseStudentsModalOpen(false)}
        courseId={courseId}
        courseName={course?.name}
      />

      {/* Course Exams Modal */}
      <CourseExamsModal
        open={courseExamsModalOpen}
        onClose={() => setCourseExamsModalOpen(false)}
        courseId={courseId}
        courseName={course?.name}
      />
    </>
  );
};

export default CourseDetailModal;
