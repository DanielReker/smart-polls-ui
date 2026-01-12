import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {Alert, Box, Button, Card, CardContent, Container, Tab, Tabs, TextField, Typography} from '@mui/material';
import {useAuth} from "../auth/AuthContext.tsx";
import {useLocation, useNavigate} from "react-router";

type AuthMode = 'login' | 'register';

export const AuthPage = () => {
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const [mode, setMode] = useState<AuthMode>('login');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { register: formRegister, handleSubmit, formState: { errors } } = useForm({
        defaultValues: { login: '', password: '' }
    });

    const onSubmit = async (data: any) => {
        setError(null);
        setIsLoading(true);
        try {
            if (mode === 'register') {
                await register(data.login, data.password);
            } else {
                await login(data.login, data.password);
            }
            navigate(from, { replace: true });
        } catch (e: any) {
            if (e.response?.status === 401 || e.response?.status === 404) {
                setError('Invalid login or password');
            } else if (e.response?.status === 409) {
                setError('Login is already used by other user');
            } else {
                setError('Server error, please try again later');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container maxWidth="xs" sx={{ mt: 8 }}>
            <Card>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={mode}
                        onChange={(_, newVal) => { setMode(newVal); setError(null); }}
                        variant="fullWidth"
                    >
                        <Tab label="Log In" value="login" />
                        <Tab label="Sign Up" value="register" />
                    </Tabs>
                </Box>

                <CardContent sx={{ pt: 3 }}>
                    <Typography variant="h5" align="center" gutterBottom>
                        {mode === 'login' ? 'Welcome back!' : 'Create new account'}
                    </Typography>

                    {mode === 'register' && (
                        <Typography variant="body2" color="text.secondary" align="center">
                            Sign Up to keep access to your polls from any device
                        </Typography>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <TextField
                            label="Login"
                            fullWidth
                            margin="normal"
                            {...formRegister('login', {
                                required: 'Enter login',
                                minLength: { value: 5, message: 'Login should be at least 5 symbols' }
                            })}
                            error={!!errors.login}
                            helperText={errors.login?.message as string}
                        />

                        <TextField
                            label="Password"
                            type="password"
                            fullWidth
                            margin="normal"
                            {...formRegister('password', {
                                required: 'Enter password',
                                minLength: { value: 6, message: 'Password should be at least 6 symbols' }
                            })}
                            error={!!errors.password}
                            helperText={errors.password?.message as string}
                        />

                        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            sx={{ mt: 3 }}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Loading...' : (mode === 'login' ? 'Log In' : 'Sign Up')}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </Container>
    );
};