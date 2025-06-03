"use client";
import React from "react";
import Link from "next/link";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { Container, Button, Avatar, Menu, MenuItem } from "@mui/material";
import { useUser } from "../../context/userContext";
import { useRouter } from "next/navigation";

export default function NavBar() {
  const { user, isLoggedIn, loginWithGoogle, logout } = useUser();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleLogout = async () => {
    await logout();
    router.push("/"); 
  };

  return (
    <AppBar position="static"  sx={{ backgroundColor: "#7B5E57" }}>
      <Container>
        <Toolbar disableGutters>
          <Link href="/" style={styles.link} >
            <Typography
              variant="h6"
              noWrap
              sx={styles.typography}
            >
             TAKE-a-SHIfT
            </Typography>
          </Link>
          <div style={{ flexGrow: 1 }} />
          {!isLoggedIn ? (
            //not logged in 
            <Button
              color="inherit"
              onClick={loginWithGoogle}
              startIcon={<Avatar src= {imageURl} />}
            >
              Login 
            </Button>
          ) : (
            //user is logged in 
            <>
              <IconButton
                edge="end"
                color="inherit"
                aria-label="user"
                sx={{ ml: 2 }}
                id="profile-menu-button"
                aria-controls="profile-menu"
                aria-haspopup="true"
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                <Avatar src={user.photoURL || "/user.png"} />
              </IconButton>
              <Menu
                id="profile-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <MenuItem
                  onClick={() => {
                    setAnchorEl(null);
                    router.push("/");
                  }
                }
                >
                  Home Page
                  </MenuItem>
                <MenuItem
                  onClick={() => {
                    setAnchorEl(null);
                    router.push("/profile");
                  }}
                >
                  Profile
                </MenuItem>
                <MenuItem
                  onClick={async () => {
                    setAnchorEl(null);
                    await handleLogout();
                  }}
                >
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}

// --- Styling ---
const styles = {
  link: {
    color: "#fff",
    textDecoration: "none",
  },
  typography: {
    mr: 2,
    fontFamily: "monospace",
    fontWeight: 700,
    letterSpacing: ".3rem",
  },
};

const imageURl= "data:image/jpeg;base64,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"