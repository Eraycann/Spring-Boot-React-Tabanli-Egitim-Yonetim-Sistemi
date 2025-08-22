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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination
} from '@mui/material';
import { 
  People as PeopleIcon, 
  School as SchoolIcon,
  Close as CloseIcon,
  Sort as SortIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon
} from '@mui/icons-material';
import { apiService } from '../utils/apiService';
import StudentEnrollmentModal from './StudentEnrollmentModal';
import StudentRemoveModal from './StudentRemoveModal';
import { useAuth } from '../hooks/useAuth';

const CourseStudentsModal = ({ open, onClose, courseId, courseName }) => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0
  });
  const [sorting, setSorting] = useState({
    field: 'student.id',
    direction: 'desc'
  });
  const [studentEnrollmentModalOpen, setStudentEnrollmentModalOpen] = useState(false);
  const [studentRemoveModalOpen, setStudentRemoveModalOpen] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);

  useEffect(() => {
    if (open && courseId) {
      fetchStudents();
    }
  }, [open, courseId]);

  const fetchStudents = async (page = 0, sortField = sorting.field, sortDirection = sorting.direction) => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        page: page.toString(),
        size: pagination.pageSize.toString(),
        sort: `${sortField},${sortDirection}`
      });
      
      const response = await apiService.get(`/course-students/${courseId}/students?${params.toString()}`);
      
      setStudents(Array.isArray(response.content) ? response.content : []);
      setPagination({
        pageNumber: response.pageNumber || 0,
        pageSize: response.pageSize || 10,
        totalElements: response.totalElements || 0,
        totalPages: response.totalPages || 0
      });
    } catch (err) {
      setError(err.message || 'Öğrenciler yüklenirken bir hata oluştu');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, newPage) => {
    fetchStudents(newPage - 1, sorting.field, sorting.direction);
  };

  const handleSortChange = (event) => {
    const [field, direction] = event.target.value.split(',');
    setSorting({ field, direction });
    fetchStudents(0, field, direction);
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
    // Move focus outside the modal before closing
    const activeElement = document.activeElement;
    if (activeElement && activeElement.closest('.MuiDialog-root')) {
      // Move focus to the first focusable element outside the modal
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstFocusableElement = Array.from(focusableElements).find(
        element => !element.closest('.MuiDialog-root')
      );
      if (firstFocusableElement) {
        firstFocusableElement.focus();
      }
    }
    
    setStudents([]);
    setError('');
    onClose();
  };

  const handleStudentEnrollmentSuccess = () => {
    // Refresh students list to show newly enrolled students
    fetchStudents();
  };

  const handleStudentRemoveSuccess = () => {
    // Refresh students list to show removed student
    fetchStudents();
    setStudentRemoveModalOpen(false);
    setStudentToRemove(null);
  };

  const handleRemoveStudent = (student) => {
    setStudentToRemove(student);
    setStudentRemoveModalOpen(true);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      disableRestoreFocus
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
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          color: 'white',
          borderRadius: '20px 20px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box className="flex items-center gap-2">
          <PeopleIcon />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Kurs Öğrencileri
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
          <Box className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-200">
            <Typography variant="body2" className="text-purple-600 font-medium mb-1">
              Kurs Bilgisi
            </Typography>
            <Typography variant="h6" className="text-gray-800 font-semibold">
              {courseName}
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Kurs ID: #{courseId}
            </Typography>
          </Box>

          {/* Students List */}
          <Box className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <Box className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4">
              <Box className="flex items-center justify-between">
                <Typography variant="h6" className="text-white font-semibold">
                  Kayıtlı Öğrenciler
                </Typography>
                <Box className="flex items-center gap-3">
                  {user?.role === 'ADMIN' || user?.role === 'TEACHER' ? (
                    <>
                      <Button
                        variant="contained"
                        startIcon={<PersonAddIcon />}
                        onClick={() => setStudentEnrollmentModalOpen(true)}
                        sx={{
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                          borderRadius: '12px',
                          textTransform: 'none',
                          fontWeight: 600,
                          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                          border: '2px solid rgba(255, 255, 255, 0.2)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                            boxShadow: '0 6px 16px rgba(139, 92, 246, 0.4)',
                            transform: 'translateY(-1px)',
                            border: '2px solid rgba(255, 255, 255, 0.3)'
                          },
                          '&:active': {
                            transform: 'translateY(0px)',
                            boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)'
                          },
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        Öğrenci Ekle
                      </Button>
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
                                      backgroundColor: '#8b5cf6',
                                      color: 'white',
                                      '&:hover': {
                                        backgroundColor: '#7c3aed'
                                      }
                                    }
                                  }
                                }
                              }
                            }}
                          >
                            <MenuItem value="student.id,desc">ID (Azalan)</MenuItem>
                            <MenuItem value="student.id,asc">ID (Artan)</MenuItem>
                            <MenuItem value="student.firstName,asc">Ad (A-Z)</MenuItem>
                            <MenuItem value="student.firstName,desc">Ad (Z-A)</MenuItem>
                            <MenuItem value="student.lastName,asc">Soyad (A-Z)</MenuItem>
                            <MenuItem value="student.lastName,desc">Soyad (Z-A)</MenuItem>
                            <MenuItem value="student.gradeLevel,asc">Sınıf (Artan)</MenuItem>
                            <MenuItem value="student.gradeLevel,desc">Sınıf (Azalan)</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </>
                  ) : (
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
                                    backgroundColor: '#8b5cf6',
                                    color: 'white',
                                    '&:hover': {
                                      backgroundColor: '#7c3aed'
                                    }
                                  }
                                }
                              }
                            }
                          }}
                        >
                          <MenuItem value="student.id,desc">ID (Azalan)</MenuItem>
                          <MenuItem value="student.id,asc">ID (Artan)</MenuItem>
                          <MenuItem value="student.firstName,asc">Ad (A-Z)</MenuItem>
                          <MenuItem value="student.firstName,desc">Ad (Z-A)</MenuItem>
                          <MenuItem value="student.lastName,asc">Soyad (A-Z)</MenuItem>
                          <MenuItem value="student.lastName,desc">Soyad (Z-A)</MenuItem>
                          <MenuItem value="student.gradeLevel,asc">Sınıf (Artan)</MenuItem>
                          <MenuItem value="student.gradeLevel,desc">Sınıf (Azalan)</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
            
            <Box className="p-4">
              {loading ? (
                <Box className="flex justify-center items-center h-32">
                  <CircularProgress size={48} sx={{ color: '#8b5cf6' }} />
                </Box>
              ) : students.length === 0 ? (
                <Box className="text-center py-8">
                  <Box className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <SchoolIcon sx={{ fontSize: 32, color: '#6b7280' }} />
                  </Box>
                  <Typography variant="h6" className="text-gray-600 mb-2">
                    Henüz öğrenci kaydı yok
                  </Typography>
                  <Typography variant="body2" className="text-gray-500">
                    Bu kursa henüz öğrenci kaydı yapılmamış
                  </Typography>
                </Box>
              ) : (
                <List>
                  {students.map((student, index) => (
                    <ListItem
                      key={student.id}
                      sx={{
                        border: '1px solid #f1f5f9',
                        borderRadius: '16px',
                        mb: 2,
                        backgroundColor: '#ffffff',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                        '&:hover': {
                          borderColor: '#8b5cf6',
                          backgroundColor: '#f8fafc',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                            width: 48,
                            height: 48
                          }}
                        >
                          {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      
                      <ListItemText
                        primary={
                          <Typography variant="h6" className="font-bold text-gray-800">
                            {student.firstName} {student.lastName}
                          </Typography>
                        }
                      />
                      
                      {/* Student Info Chips */}
                      <Box className="flex items-center gap-2 ml-4">
                        <Chip 
                          label={`ID: ${student.id}`}
                          size="small"
                          sx={{
                            backgroundColor: '#f0f9ff',
                            color: '#0369a1',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}
                        />
                        {student.gradeLevel && (
                          <Chip 
                            label={getGradeLevelText(student.gradeLevel)}
                            size="small"
                            sx={{
                              backgroundColor: getGradeLevelColor(student.gradeLevel).bg,
                              color: getGradeLevelColor(student.gradeLevel).color,
                              fontWeight: 600,
                              fontSize: '0.75rem'
                            }}
                          />
                        )}
                      </Box>
                      
                      {/* Remove Button */}
                      {user?.role === 'ADMIN' || user?.role === 'TEACHER' ? (
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveStudent(student)}
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
                          <PersonRemoveIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      ) : null}
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
                    Toplam <span className="font-semibold text-purple-600">{pagination.totalElements}</span> öğrenci,{' '}
                    <span className="font-semibold text-purple-600">{pagination.totalPages}</span> sayfa
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

      {/* Student Enrollment Modal */}
      {user?.role === 'ADMIN' || user?.role === 'TEACHER' ? (
        <StudentEnrollmentModal
          open={studentEnrollmentModalOpen}
          onClose={() => setStudentEnrollmentModalOpen(false)}
          courseId={courseId}
          courseName={courseName}
          onSuccess={handleStudentEnrollmentSuccess}
        />
      ) : null}

      {/* Student Remove Modal */}
      {user?.role === 'ADMIN' || user?.role === 'TEACHER' ? (
        <StudentRemoveModal
          open={studentRemoveModalOpen}
          onClose={() => setStudentRemoveModalOpen(false)}
          student={studentToRemove}
          courseId={courseId}
          courseName={courseName}
          onSuccess={handleStudentRemoveSuccess}
        />
      ) : null}
    </Dialog>
  );
};

export default CourseStudentsModal;
