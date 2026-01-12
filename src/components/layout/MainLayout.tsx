import {AppBar, Box, Button, Chip, Container, Toolbar, Typography} from '@mui/material';
import {useAuth} from "../../auth/AuthContext.tsx";
import {Link, Outlet, useLocation, useNavigate} from "react-router";

function PersonIcon() {
    return null;
}

export const MainLayout = () => {
    const { isRegistered, userLogin, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate('/login', { state: { from: location } });
    };

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
                            Smart Polls
                        </Link>
                    </Typography>

                    <Box display="flex" gap={2} alignItems="center">
                        {isRegistered ? (
                            <>
                                <Chip
                                    icon={<PersonIcon />}
                                    label={userLogin}
                                    color="secondary"
                                    variant="outlined"
                                    sx={{ color: 'white', borderColor: 'white', '& .MuiChip-icon': { color: 'white' } }}
                                />
                                <Button color="inherit" onClick={logout}>Log Out</Button>
                            </>
                        ) : (
                            <>
                                <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'block' } }}>
                                    You're guest
                                </Typography>
                                <Button color="inherit" variant="outlined" onClick={handleLoginClick}>
                                    Sign In / Sign Up
                                </Button>
                            </>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>
            <Container sx={{ mt: 4 }}>
                <Outlet />
            </Container>
        </>
    );
};