import { Box } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <Box className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <Box className="flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar />
        
        {/* Content Area */}
        <Box className="flex-1 overflow-auto pt-16 pl-70">
          <Box className="p-8">
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
