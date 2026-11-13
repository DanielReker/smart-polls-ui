import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {Alert, Box, Button, CircularProgress, Snackbar, TextField, Typography} from '@mui/material';
import {useCreateQuiz} from "../api/generated";
import {useNavigate} from "react-router";

export const CreateQuizPage = () => {
    const {register, handleSubmit} = useForm<{ name: string; description: string }>();
    const navigate = useNavigate();
    const {mutateAsync: createQuiz, isPending: isCreating} = useCreateQuiz();

    const [notification, setNotification] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error';
    }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const onSubmit = async (data: { name: string; description: string }) => {
        try {
            const newQuiz = await createQuiz({data});
            navigate(`/quizzes/${newQuiz.id}/edit`);
        } catch {
            setNotification({
                open: true,
                message: 'Ошибка при создании теста',
                severity: 'error'
            });
        }
    };

    return (
        <Box maxWidth="sm" sx={{mx: 'auto'}}>
            <Typography variant="h5" gutterBottom>Новый тест</Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
                <TextField fullWidth label="Название" {...register('name')} margin="normal" required />
                <TextField fullWidth label="Описание" {...register('description')} margin="normal" multiline rows={3} />
                <Button type="submit" variant="contained" fullWidth sx={{mt: 2}} disabled={isCreating}>
                    {isCreating ? <CircularProgress size={24} color="inherit" /> : 'Далее'}
                </Button>
            </form>

            <Snackbar
                open={notification.open}
                autoHideDuration={5000}
                onClose={() => setNotification(prev => ({...prev, open: false}))}
                anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
            >
                <Alert
                    onClose={() => setNotification(prev => ({...prev, open: false}))}
                    severity={notification.severity}
                    sx={{width: '100%', boxShadow: 3}}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};