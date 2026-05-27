"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Chip,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  AddCircle as AddCircleIcon,
  People as PeopleIcon,
  Receipt as ReceiptIcon,
  Leaderboard as LeaderboardIcon,
  PendingActions as PendingActionsIcon,
  Payments as PaymentsIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Home as HomeIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
} from "@mui/icons-material";

export default function Navigation() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  if (!user) return null;

  const getNavItems = () => {
    switch (user.role) {
      case "borrower":
        return [
          {
            name: "Dashboard",
            href: "/borrower/dashboard",
            icon: <DashboardIcon />,
          },
          {
            name: "New Application",
            href: "/borrower/apply",
            icon: <AddCircleIcon />,
          },
        ];
      case "admin":
        return [{ name: "Overview", href: "/admin", icon: <DashboardIcon /> }];
      case "sales":
        return [
          { name: "Leads", href: "/sales", icon: <PeopleIcon /> },
          { name: "Dashboard", href: "/sales", icon: <DashboardIcon /> },
        ];
      case "sanction":
        return [
          {
            name: "Pending Reviews",
            href: "/sanction",
            icon: <PendingActionsIcon />,
          },
        ];
      case "disbursement":
        return [
          {
            name: "Ready to Disburse",
            href: "/disbursement",
            icon: <PaymentsIcon />,
          },
        ];
      case "collection":
        return [
          {
            name: "Active Loans",
            href: "/collection",
            icon: <AccountBalanceIcon />,
          },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const getRoleColor = () => {
    const colors: Record<string, string> = {
      borrower: "#667eea",
      admin: "#f093fb",
      sales: "#4facfe",
      sanction: "#43e97b",
      disbursement: "#fa709a",
      collection: "#fee140",
    };
    return colors[user.role] || "#667eea";
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ width: 280, bgcolor: "background.paper", height: "100%" }}>
      <Box
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${getRoleColor()} 0%, #764ba2 100%)`,
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.2)",
              width: 48,
              height: 48,
            }}
          >
            {user.fullName?.[0] || user.email[0].toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              {user.fullName || user.email.split("@")[0]}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {user.email}
            </Typography>
          </Box>
        </Box>
        <Chip
          label={user.role.toUpperCase()}
          size="small"
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.2)",
            color: "white",
            fontWeight: "bold",
          }}
        />
      </Box>

      <List sx={{ pt: 2 }}>
        {navItems.map((item) => (
          <ListItem
            key={item.href}
            component={Link}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            sx={{
              mb: 1,
              mx: 1,
              borderRadius: 2,
              bgcolor:
                pathname === item.href
                  ? "rgba(102, 126, 234, 0.1)"
                  : "transparent",
              color: pathname === item.href ? "primary.main" : "text.primary",
              "&:hover": {
                bgcolor: "rgba(102, 126, 234, 0.08)",
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: pathname === item.href ? "primary.main" : "inherit",
                minWidth: 40,
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.name} />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      <List>
        <ListItem
          onClick={handleLogout}
          sx={{
            mb: 1,
            mx: 1,
            borderRadius: 2,
            cursor: "pointer",
            color: "error.main",
            "&:hover": {
              bgcolor: "rgba(211, 47, 47, 0.08)",
            },
          }}
        >
          <ListItemIcon sx={{ color: "error.main", minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, md: 4 } }}>
          {/* Logo */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {isMobile && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Link
              href={
                user.role === "borrower"
                  ? "/borrower/dashboard"
                  : `/${user.role}`
              }
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  background: `linear-gradient(135deg, ${getRoleColor()} 0%, #764ba2 100%)`,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="h6" fontWeight="bold" color="white">
                  L
                </Typography>
              </Box>
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{
                  background: `linear-gradient(135deg, ${getRoleColor()} 0%, #764ba2 100%)`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                LoanFlow
              </Typography>
            </Link>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  startIcon={item.icon}
                  sx={{
                    textTransform: "none",
                    fontWeight: 500,
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    bgcolor:
                      pathname === item.href
                        ? "rgba(102, 126, 234, 0.1)"
                        : "transparent",
                    color:
                      pathname === item.href ? "primary.main" : "text.primary",
                    "&:hover": {
                      bgcolor: "rgba(102, 126, 234, 0.08)",
                    },
                  }}
                >
                  {item.name}
                </Button>
              ))}
            </Box>
          )}

          {/* User Menu */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {!isMobile && (
              <Chip
                label={user.role.toUpperCase()}
                size="small"
                sx={{
                  bgcolor: `linear-gradient(135deg, ${getRoleColor()} 0%, #764ba2 100%)`,
                  color: "white",
                  fontWeight: "bold",
                }}
              />
            )}
            <IconButton onClick={handleMenuOpen} size="small">
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: `linear-gradient(135deg, ${getRoleColor()} 0%, #764ba2 100%)`,
                }}
              >
                {user.fullName?.[0] || user.email[0].toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              PaperProps={{
                sx: {
                  mt: 1,
                  width: 280,
                  borderRadius: 2,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                },
              }}
            >
              <Box sx={{ p: 2, textAlign: "center" }}>
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    mx: "auto",
                    mb: 1,
                    bgcolor: `linear-gradient(135deg, ${getRoleColor()} 0%, #764ba2 100%)`,
                  }}
                >
                  {user.fullName?.[0] || user.email[0].toUpperCase()}
                </Avatar>
                <Typography variant="subtitle1" fontWeight="bold">
                  {user.fullName || "User"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
                <Chip
                  label={user.role.toUpperCase()}
                  size="small"
                  sx={{
                    mt: 1,
                    bgcolor: `linear-gradient(135deg, ${getRoleColor()} 0%, #764ba2 100%)`,
                    color: "white",
                    fontWeight: "bold",
                  }}
                />
              </Box>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" color="error" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: 280, boxSizing: "border-box" },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}
