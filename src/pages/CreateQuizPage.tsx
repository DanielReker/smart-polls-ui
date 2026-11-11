import { useForm } from 'react-hook-form';
import { TextField, Button, Box, Typography } from '@mui/material';
import {useCreateQuiz} from "../api/generated";
import {useNavigate} from "react-router";

export const CreateQuizPage = () => {
    const { register, handleSubmit } = useForm<{ name: string; description: string }>();
    const navigate = useNavigate();
    const { mutateAsync: createQuiz } = useCreateQuiz();

    const onSubmit = async (data: { name: string; description: string }) => {
        try {
            const newQuiz = await createQuiz({ data });
            navigate(`/quizzes/${newQuiz.id}/edit`);
        } catch {
            alert(`Ошибка при создании теста`);
        }
    };

    return (
        <Box maxWidth="sm" sx={{ mx: 'auto' }}>
            <Typography variant="h5" gutterBottom>Новый тест</Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
                <TextField fullWidth label="Название" {...register('name')} margin="normal" required />
                <TextField fullWidth label="Описание" {...register('description')} margin="normal" multiline rows={3} />
                <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>Далее</Button>
            </form>
        </Box>
    );
};