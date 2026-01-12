import { AppBar, Toolbar, Typography, Container, Button } from '@mui/material';
import {useAuth} from "../../auth/AuthContext.tsx";
import {Link, Outlet} from "react-router";

export const MainLayout = () => {
    const { isAuthenticated, logout } = useAuth();

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
                            Smart Polls
                        </Link>
                    </Typography>
                    {isAuthenticated && (
                        <Button color="inherit" onClick={logout}>Logout</Button>
                    )}
                </Toolbar>
            </AppBar>
            <Container sx={{ mt: 4 }}>
                <Outlet />
            </Container>
        </>
    );
};