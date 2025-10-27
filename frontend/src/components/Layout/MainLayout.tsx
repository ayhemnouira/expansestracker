import { Box } from "@mui/material";

import { Outlet } from "react-router-dom";
import Sidebar from "../../global/sidebar/Sidebar";
import Topbar from "../../global/Topbar";

const MainLayout = () => {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        {/* Topbar */}
        <Topbar />

        {/* Main Content */}
        <Box
          sx={{
            flexGrow: 1,
            paddingTop: 3,
            paddingBottom: 3,
            paddingLeft: 3,
            backgroundColor: (theme) => theme.palette.background.default,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
