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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination
} from '@mui/material';
import { 
  PersonAdd as PersonAddIcon, 
  Search as SearchIcon,
  Clear as ClearIcon,
  School as SchoolIcon,
  Close as CloseIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { apiService } from '../utils/apiService';

const StudentEnrollmentModal = ({ open, onClose, courseId, courseName, onSuccess }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useState({
    firstName: '',
    lastName: '',
    gradeLevel: ''
  });
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

      // Add search filters
      if (searchParams.firstName?.trim()) {
        params.append('firstName', searchParams.firstName.trim());
      }
      if (searchParams.lastName?.trim()) {
        params.append('lastName', searchParams.lastName.trim());
      }
      if (searchParams.gradeLevel) {
        params.append('gradeLevel', searchParams.gradeLevel);
      }
      
      const response = await apiService.get(`/students/search?${params.toString()}`);
      
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

  const handleSearch = () => {
    fetchStudents(0, sorting.field, sorting.direction);
  };

  const handleClearSearch = () => {
    setSearchParams({
      firstName: '',
      lastName: '',
      gradeLevel: ''
    });
    fetchStudents(0, sorting.field, sorting.direction);
  };

  const handleEnrollStudent = async (studentId) => {
    try {
      setEnrolling(true);
      setError('');
      
      await apiService.post(`/course-students/${courseId}/students/${studentId}`);
      
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Öğrenci kursa eklenirken bir hata oluştu');
    } finally {
      setEnrolling(false);
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
    setStudents([]);
    setError('');
    setSearchParams({
      firstName: '',
      lastName: '',
      gradeLevel: ''
    });
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
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle
        sx={{
          pb: 1,
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          color: 'white',
          borderRadius: '20px 20px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box className="flex items-center gap-2">
          <PersonAddIcon />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Öğrenci Ekle
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
          <Box className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
            <Typography variant="body2" className="text-green-600 font-medium mb-1">
              Kurs Bilgisi
            </Typography>
            <Typography variant="h6" className="text-gray-800 font-semibold">
              {courseName}
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Kurs ID: #{courseId}
            </Typography>
          </Box>

          {/* Search Section */}
          <Box className="bg-white rounded-xl border border-gray-200 p-4">
            <Typography variant="h6" className="text-gray-800 font-semibold mb-3">
              Öğrenci Ara
            </Typography>
            
            <Box className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <TextField
                fullWidth
                label="Ad"
                variant="outlined"
                value={searchParams.firstName}
                onChange={(e) => setSearchParams(prev => ({ ...prev, firstName: e.target.value }))}
                placeholder="Öğrenci adı..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#059669'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#059669',
                      borderWidth: '2px'
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#059669'
                  }
                }}
              />
              
              <TextField
                fullWidth
                label="Soyad"
                variant="outlined"
                value={searchParams.lastName}
                onChange={(e) => setSearchParams(prev => ({ ...prev, lastName: e.target.value }))}
                placeholder="Öğrenci soyadı..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#059669'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#059669',
                      borderWidth: '2px'
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#059669'
                  }
                }}
              />
              
              <FormControl fullWidth>
                <InputLabel 
                  sx={{ 
                    color: '#374151', 
                    fontWeight: 600,
                    backgroundColor: 'white',
                    padding: '0 8px',
                    '&.Mui-focused': {
                      color: '#059669',
                      backgroundColor: 'white'
                    }
                  }}
                >
                  Sınıf Seviyesi
                </InputLabel>
                <Select
                  value={searchParams.gradeLevel}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, gradeLevel: e.target.value }))}
                  label="Sınıf Seviyesi"
                  sx={{
                    borderRadius: '12px',
                    backgroundColor: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#d1d5db',
                      borderWidth: '2px',
                      '&:hover': {
                        borderColor: '#059669'
                      }
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#059669',
                      borderWidth: '2px'
                    }
                  }}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value={9}>9. Sınıf</MenuItem>
                  <MenuItem value={10}>10. Sınıf</MenuItem>
                  <MenuItem value={11}>11. Sınıf</MenuItem>
                  <MenuItem value={12}>12. Sınıf</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box className="flex items-center gap-3">
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
                disabled={loading}
                sx={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)'
                  }
                }}
              >
                Ara
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleClearSearch}
                disabled={loading}
                sx={{
                  borderColor: '#6b7280',
                  color: '#6b7280',
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#374151',
                    color: '#374151'
                  }
                }}
              >
                Temizle
              </Button>
            </Box>
          </Box>

          {/* Students List */}
          <Box className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <Box className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
              <Box className="flex items-center justify-between">
                <Typography variant="h6" className="text-white font-semibold">
                  Öğrenci Listesi
                </Typography>
                <Box className="flex items-center gap-2 bg-white bg-opacity-20 px-3 py-1 rounded-lg">
                  <SchoolIcon sx={{ color: 'white', fontSize: 18 }} />
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={`${sorting.field},${sorting.direction}`}
                      onChange={handleSortChange}
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
                      <MenuItem value="firstName,asc">Ad (A-Z)</MenuItem>
                      <MenuItem value="firstName,desc">Ad (Z-A)</MenuItem>
                      <MenuItem value="lastName,asc">Soyad (A-Z)</MenuItem>
                      <MenuItem value="lastName,desc">Soyad (Z-A)</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </Box>
            
            <Box className="p-4">
              {loading ? (
                <Box className="flex justify-center items-center h-32">
                  <CircularProgress size={48} sx={{ color: '#059669' }} />
                </Box>
              ) : students.length === 0 ? (
                <Box className="text-center py-8">
                  <Box className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <SchoolIcon sx={{ fontSize: 32, color: '#6b7280' }} />
                  </Box>
                  <Typography variant="h6" className="text-gray-600 mb-2">
                    Öğrenci bulunamadı
                  </Typography>
                  <Typography variant="body2" className="text-gray-500">
                    Arama kriterlerinizi değiştirerek tekrar deneyin
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
                          borderColor: '#059669',
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
                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
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
                        secondary={
                          <Box className="flex items-center gap-2 mt-1">
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
                        }
                      />
                      
                      <Button
                        variant="contained"
                        startIcon={enrolling ? <CircularProgress size={16} color="inherit" /> : <CheckIcon />}
                        onClick={() => handleEnrollStudent(student.id)}
                        disabled={enrolling}
                        sx={{
                          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                          borderRadius: '12px',
                          textTransform: 'none',
                          fontWeight: 600,
                          boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
                            boxShadow: '0 6px 16px rgba(5, 150, 105, 0.4)'
                          },
                          '&:disabled': {
                            background: '#d1d5db',
                            boxShadow: 'none'
                          }
                        }}
                      >
                        {enrolling ? 'Ekleniyor...' : 'Ekle'}
                      </Button>
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
                    Toplam <span className="font-semibold text-green-600">{pagination.totalElements}</span> öğrenci,{' '}
                    <span className="font-semibold text-green-600">{pagination.totalPages}</span> sayfa
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
                          backgroundColor: '#059669',
                          color: '#ffffff',
                          '&:hover': {
                            backgroundColor: '#047857'
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
    </Dialog>
  );
};

export default StudentEnrollmentModal;
