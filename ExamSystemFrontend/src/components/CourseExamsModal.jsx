import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  Pagination
} from '@mui/material';
import { 
  Quiz as QuizIcon, 
  School as SchoolIcon,
  Close as CloseIcon,
  Sort as SortIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { apiService } from '../utils/apiService';
import { useAuth } from '../hooks/useAuth';
import ExamAddModal from './ExamAddModal';
import ExamEditModal from './ExamEditModal';
import ExamDeleteModal from './ExamDeleteModal';
import ExamActivateModal from './ExamActivateModal';

const CourseExamsModal = ({ open, onClose, courseId, courseName }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [examAddModalOpen, setExamAddModalOpen] = useState(false);
  const [examEditModalOpen, setExamEditModalOpen] = useState(false);
  const [examDeleteModalOpen, setExamDeleteModalOpen] = useState(false);
  const [examActivateModalOpen, setExamActivateModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
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

  useEffect(() => {
    if (open && courseId) {
      fetchExams();
    }
  }, [open, courseId]);

  const fetchExams = async (page = 0, sortField = sorting.field, sortDirection = sorting.direction) => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        page: page.toString(),
        size: pagination.pageSize.toString(),
        sort: `${sortField},${sortDirection}`
      });
      
      const response = await apiService.get(`/courses/${courseId}/exams?${params.toString()}`);
      
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
    fetchExams(newPage - 1, sorting.field, sorting.direction);
  };

  const handleSortChange = (event) => {
    const [field, direction] = event.target.value.split(',');
    setSorting({ field, direction });
    fetchExams(0, field, direction);
  };

  const handleClose = () => {
    setExams([]);
    setError('');
    setExamAddModalOpen(false);
    setExamEditModalOpen(false);
    setExamDeleteModalOpen(false);
    setExamActivateModalOpen(false);
    setSelectedExam(null);
    onClose();
  };

  const handleExamAddSuccess = (newExam) => {
    // Refresh exams list to show the new exam
    fetchExams();
  };

  const handleEditExam = (exam) => {
    setSelectedExam(exam);
    setExamEditModalOpen(true);
  };

  const handleEditExamSuccess = (updatedExam) => {
    // Refresh exams list to show the updated exam
    fetchExams();
  };

  const handleDeleteExam = (exam) => {
    setSelectedExam(exam);
    setExamDeleteModalOpen(true);
  };

  const handleDeleteExamSuccess = (deletedExamId) => {
    // Refresh exams list to show the updated list after deletion
    fetchExams();
  };

  const handleActivateExam = (exam) => {
    setSelectedExam(exam);
    setExamActivateModalOpen(true);
  };

  const handleActivateExamSuccess = (activatedExam) => {
    // Refresh exams list to show the updated exam
    fetchExams();
  };

  const handleExamClick = (examId) => {
    if (examId) {
      handleClose(); // Close the modal first
      navigate(`/exam-detail/${examId}`);
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

  return (
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
      <DialogTitle
        sx={{
          pb: 1,
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: 'white',
          borderRadius: '20px 20px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box className="flex items-center gap-2">
          <QuizIcon />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Kurs Sınavları
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
        {error && (
          <Alert severity="error" className="mb-4 rounded-xl">
            {error}
          </Alert>
        )}

        <Box className="space-y-4">
          {/* Course Info */}
          <Box className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-200">
            <Typography variant="body2" className="text-orange-600 font-medium mb-1">
              Kurs Bilgisi
            </Typography>
            <Typography variant="h6" className="text-gray-800 font-semibold">
              {courseName}
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Kurs ID: #{courseId}
            </Typography>
          </Box>

          {/* Exams List */}
          <Box className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <Box className="bg-gradient-to-r from-orange-500 to-amber-600 p-4">
              <Box className="flex items-center justify-between">
                <Typography variant="h6" className="text-white font-semibold">
                  Sınav Listesi
                </Typography>
                <Box className="flex items-center gap-3">
                  {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_TEACHER') && (
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setExamAddModalOpen(true)}
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
                      Sınav Ekle
                    </Button>
                  )}
                  <Box className="flex items-center gap-2 bg-white bg-opacity-10 px-4 py-2 rounded-xl border border-white border-opacity-20">
                    <SortIcon sx={{ color: 'white', fontSize: 20 }} />
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                      <Select
                        value={`${sorting.field},${sorting.direction}`}
                        onChange={handleSortChange}
                        sx={{
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          '& .MuiSelect-icon': { color: 'white' },
                          '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                          '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
                          '& .MuiSelect-select': {
                            paddingRight: '32px',
                            paddingLeft: '8px'
                          }
                        }}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              backgroundColor: '#ffffff',
                              borderRadius: '12px',
                              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                              border: '1px solid #e5e7eb',
                              '& .MuiMenuItem-root': {
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: '#374151',
                                '&:hover': {
                                  backgroundColor: '#f3f4f6'
                                },
                                '&.Mui-selected': {
                                  backgroundColor: '#f59e0b',
                                  color: 'white',
                                  '&:hover': {
                                    backgroundColor: '#d97706'
                                  }
                                }
                              }
                            }
                          }
                        }}
                      >
                        <MenuItem value="id,desc">ID (Azalan)</MenuItem>
                        <MenuItem value="id,asc">ID (Artan)</MenuItem>
                        <MenuItem value="name,asc">Ad (A-Z)</MenuItem>
                        <MenuItem value="name,desc">Ad (Z-A)</MenuItem>
                        <MenuItem value="durationInMinutes,asc">Süre (Artan)</MenuItem>
                        <MenuItem value="durationInMinutes,desc">Süre (Azalan)</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              </Box>
            </Box>
            
            <Box className="p-4">
              {loading ? (
                <Box className="flex justify-center items-center h-32">
                  <CircularProgress size={48} sx={{ color: '#f59e0b' }} />
                </Box>
              ) : exams.length === 0 ? (
                <Box className="text-center py-8">
                  <Box className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <QuizIcon sx={{ fontSize: 32, color: '#6b7280' }} />
                  </Box>
                  <Typography variant="h6" className="text-gray-600 mb-2">
                    Henüz sınav eklenmemiş
                  </Typography>
                  <Typography variant="body2" className="text-gray-500">
                    Bu kursa henüz sınav eklenmemiş
                  </Typography>
                </Box>
              ) : (
                <List>
                  {exams.map((exam, index) => (
                    <ListItem
                      key={exam.id}
                      sx={{
                        border: '1px solid #f1f5f9',
                        borderRadius: '16px',
                        mb: 2,
                        backgroundColor: '#ffffff',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: '#f59e0b',
                          backgroundColor: '#f8fafc',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                      onClick={() => handleExamClick(exam.id)}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            width: 48,
                            height: 48
                          }}
                        >
                          <QuizIcon />
                        </Avatar>
                      </ListItemAvatar>
                      
                      <ListItemText
                        primary={
                          <Typography variant="h6" className="font-bold text-gray-800">
                            {exam.name}
                          </Typography>
                        }
                        secondary={
                          <Box className="flex items-center gap-2 mt-1">
                            <Chip
                              icon={<ScheduleIcon />}
                              label={formatDuration(exam.durationInMinutes)}
                              size="small"
                              sx={{
                                backgroundColor: '#f0f9ff',
                                color: '#0369a1',
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}
                            />
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
                        }
                      />
                      
                      {/* Exam Info Chips */}
                      <Box className="flex items-center gap-2 ml-4">
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
                        <Chip
                          label={exam.courseName}
                          size="small"
                          sx={{
                            backgroundColor: '#fef3c7',
                            color: '#92400e',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}
                        />
                        
                        {/* View Details Button */}
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExamClick(exam.id);
                          }}
                          sx={{
                            borderColor: '#f59e0b',
                            color: '#f59e0b',
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 500,
                            fontSize: '0.75rem',
                            px: 2,
                            py: 0.5,
                            '&:hover': {
                              borderColor: '#d97706',
                              color: '#d97706',
                              backgroundColor: 'rgba(245, 158, 11, 0.04)'
                            }
                          }}
                        >
                          Detay
                        </Button>
                        
                        {/* Action Buttons */}
                        {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_TEACHER') && (
                          <Box className="flex items-center gap-1">
                            {!exam.active && (
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleActivateExam(exam);
                                }}
                                sx={{
                                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                  color: 'white',
                                  width: 32,
                                  height: 32,
                                  boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                    transform: 'scale(1.1)',
                                    boxShadow: '0 4px 8px rgba(16, 185, 129, 0.4)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                <PlayIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            )}
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditExam(exam);
                              }}
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
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteExam(exam);
                              }}
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
                          </Box>
                        )}
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Box className="bg-gray-50 p-4 border-t border-gray-200">
                <Box className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <Typography variant="body2" className="text-gray-600">
                    Toplam <span className="font-semibold text-orange-600">{pagination.totalElements}</span> sınav,{' '}
                    <span className="font-semibold text-orange-600">{pagination.totalPages}</span> sayfa
                  </Typography>
                  
                  <Pagination
                    count={pagination.totalPages}
                    page={pagination.pageNumber + 1}
                    onChange={handlePageChange}
                    color="primary"
                    size="medium"
                    sx={{
                      '& .MuiPaginationItem-root': {
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '0.875rem',
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
              </Box>
            )}
          </Box>
        </Box>
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

      {/* Exam Add Modal */}
      <ExamAddModal
        open={examAddModalOpen}
        onClose={() => setExamAddModalOpen(false)}
        courseId={courseId}
        courseName={courseName}
        onSuccess={handleExamAddSuccess}
      />

      {/* Exam Edit Modal */}
      <ExamEditModal
        open={examEditModalOpen}
        onClose={() => {
          setExamEditModalOpen(false);
          setSelectedExam(null);
        }}
        exam={selectedExam}
        onSuccess={handleEditExamSuccess}
      />

      {/* Exam Delete Modal */}
      <ExamDeleteModal
        open={examDeleteModalOpen}
        onClose={() => {
          setExamDeleteModalOpen(false);
          setSelectedExam(null);
        }}
        exam={selectedExam}
        onSuccess={handleDeleteExamSuccess}
      />

      {/* Exam Activate Modal */}
      <ExamActivateModal
        open={examActivateModalOpen}
        onClose={() => {
          setExamActivateModalOpen(false);
          setSelectedExam(null);
        }}
        exam={selectedExam}
        onSuccess={handleActivateExamSuccess}
      />
    </Dialog>
  );
};

export default CourseExamsModal;
