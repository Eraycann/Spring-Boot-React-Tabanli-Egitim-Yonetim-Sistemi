import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Typography, Divider } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Book as BookIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Quiz as QuizIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const getMenuItems = () => {
    switch (user?.role) {
      case 'ROLE_ADMIN':
        return [
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
          { text: 'Tüm Kurslar', icon: <SearchIcon />, path: '/all-courses' },
          { text: 'Sınav Ara', icon: <QuizIcon />, path: '/exam-search' },
          { text: 'Sınav Girişleri', icon: <AssignmentTurnedInIcon />, path: '/exam-submissions' },
          { text: 'Öğretmen Yönetimi', icon: <PeopleIcon />, path: '/teachers' },
          { text: 'Öğrenci Yönetimi', icon: <SchoolIcon />, path: '/students' },
          { text: 'Veli Yönetimi', icon: <PersonIcon />, path: '/parents' }
        ];

      case 'ROLE_TEACHER':
        return [
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
          { text: 'Kurslarım', icon: <BookIcon />, path: '/teacher-courses' },
          { text: 'Tüm Kurslar', icon: <SearchIcon />, path: '/all-courses' },
          { text: 'Kurs Oluştur', icon: <AddIcon />, path: '/create-course' },
          { text: 'Sınav Ara', icon: <QuizIcon />, path: '/exam-search' },
          { text: 'Sınav Girişleri', icon: <AssignmentTurnedInIcon />, path: '/exam-submissions' }
        ];

      case 'ROLE_STUDENT':
        return [
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
          { text: 'Kurslarım', icon: <BookIcon />, path: '/my-courses' },
          { text: 'Sınav Ara', icon: <QuizIcon />, path: '/exam-search' },
          { text: 'Sınav Girişleri', icon: <AssignmentTurnedInIcon />, path: '/exam-submissions' }
        ];

      case 'ROLE_PARENT':
        return [
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
          { text: 'Sınav Ara', icon: <QuizIcon />, path: '/exam-search' },
          { text: 'Sınav Girişleri', icon: <AssignmentTurnedInIcon />, path: '/exam-submissions' }
        ];

      default:
        return [
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
          { text: 'Sınav Ara', icon: <QuizIcon />, path: '/exam-search' },
          { text: 'Sınav Girişleri', icon: <AssignmentTurnedInIcon />, path: '/exam-submissions' }
        ];
    }
  };

  const handleMenuItemClick = (path) => {
    navigate(path);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          backgroundColor: '#f8fafc',
          borderRight: '1px solid #e2e8f0'
        }
      }}
    >
      <Box className="p-6">
        <Typography
          variant="h5"
          className="font-bold text-gray-800 mb-8 text-center"
          sx={{ fontWeight: 700, color: '#1e293b' }}
        >
          Menü
        </Typography>

        <Divider className="mb-6" />

        <List className="space-y-2">
          {getMenuItems().map((item, index) => (
            <ListItem
              key={index}
              onClick={() => handleMenuItemClick(item.path)}
              className="mb-2 rounded-xl hover:bg-blue-50 transition-all duration-200 cursor-pointer"
              sx={{
                borderRadius: '12px',
                '&:hover': {
                  backgroundColor: '#eff6ff',
                  transform: 'translateX(4px)'
                }
              }}
            >
              <ListItemIcon
                className="text-gray-600"
                sx={{
                  minWidth: 40,
                  color: '#4b5563'
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                className="text-gray-700 font-medium"
                sx={{
                  '& .MuiListItemText-primary': {
                    fontWeight: 500,
                    color: '#374151'
                  }
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
