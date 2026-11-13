import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {Alert, Box, Button, Card, CircularProgress, Container, Snackbar, Typography} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import {Link, useNavigate, useParams} from "react-router";
import {useCreateSubmission, useGetQuiz} from "../api/generated";
import type {QuestionDtoVariant, SubmissionCreateRequest} from "../api/generated/model";
import {QuestionInputFactory} from "../components/questions/QuestionInputFactory.tsx";
import {useAuth} from "../auth/AuthContext.tsx";

export type SubmissionFormValues = {
    [questionId: string]: string | string[];
};

export const TakeQuizPage = () => {
    const { quizId: id } = useParams<{ quizId: string }>();

    if (!id) {
        throw new Error("Missing quizId param");
    }

    const [isSuccess, setIsSuccess] = useState(false);
    const [notification, setNotification] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error';
    }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const navigate = useNavigate();

    const { isAdmin } = useAuth();

    const { data: quiz, isLoading, error } = useGetQuiz(id);
    const { mutateAsync: submitQuiz, isPending: isSubmitting } = useCreateSubmission();

    const { control, handleSubmit } = useForm<SubmissionFormValues>();

    const onSubmit = async (data: SubmissionFormValues) => {
        if (!quiz?.questions) return;

        const request: SubmissionCreateRequest = {
            answers: []
        };

        quiz.questions.forEach((question) => {
            if (!question.id) {
                throw new Error("Question ID can't be null")
            }

            const value = data[question.id];

            if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
                return;
            }

            if (question.dtype === 'text') {
                request.answers.push({
                    dtype: 'text',
                    questionId: question.id,
                    value: value as string
                });
            } else if (question.dtype === 'single-choice') {
                request.answers.push({
                    dtype: 'single-choice',
                    questionId: question.id,
                    selectedChoiceId: value as string
                });
            } else if (question.dtype === 'multi-choice') {
                request.answers.push({
                    dtype: 'multi-choice',
                    questionId: question.id,
                    selectedChoiceIds: value as string[]
                });
            }
        });

        try {
            await submitQuiz({ quizId: id, data: request });
            setIsSuccess(true);
        } catch (e) {
            console.error(e);
            setNotification({
                open: true,
                message: 'Ошибка при попытке отправить ответы',
                severity: 'error'
            });
        }
    };

    if (isLoading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
    if (error || !quiz) return <Container sx={{ mt: 4 }}><Alert severity="error">Тест не найден</Alert></Container>;
    if (quiz.status === 'DRAFT') return (
        <Card sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
                Тест ещё не начался
            </Typography>
            <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={() => navigate(`/quizzes/${id}/edit`)}
            >
                Перейти к редактированию
            </Button>
        </Card>
    );
    if (quiz.status === 'FINISHED') return (
        <Card sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
                Тест уже завершён
            </Typography>
            <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={() => navigate(`/quizzes/${id}/stats`)}
            >
                Просмотреть статистику
            </Button>
        </Card>
    );

    if ((isSuccess || quiz.mySubmissionsCount > 0) && !isAdmin) {
        return (
            <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
                <CheckCircleOutlineIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
                <Typography variant="h4" gutterBottom>Спасибо!</Typography>
                <Typography variant="body1" color="text.secondary">
                    Ваши ответы успешно отправлены
                </Typography>
                <Button component={Link} to="/" variant="contained" sx={{ mt: 2 }}>
                    Домашняя страница
                </Button>
            </Container>
        );
    }

    const sortedQuestions = [...(quiz.questions || [])]
        .sort((a, b) => a.position - b.position);

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box mb={4}>
                <Typography variant="h3" gutterBottom>{quiz.name}</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {quiz.description}
                </Typography>
            </Box>

            <form onSubmit={handleSubmit(onSubmit)}>
                {sortedQuestions.map((question: QuestionDtoVariant) => (
                    <QuestionInputFactory
                        key={question.id}
                        question={question}
                        control={control}
                    />
                ))}

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        endIcon={isSubmitting ? <CircularProgress size={20} color="inherit"/> : <SendIcon />}
                        disabled={isSubmitting}
                        sx={{ px: 4, py: 1.5 }}
                    >
                        Отправить ответы
                    </Button>
                </Box>
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
        </Container>
    );
};