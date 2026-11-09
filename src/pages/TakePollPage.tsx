import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {Alert, Box, Button, Card, CircularProgress, Container, Typography} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import {Link, useNavigate, useParams} from "react-router";
import {useCreateSubmission, useGetPoll} from "../api/generated";
import type {QuestionDtoVariant, SubmissionCreateRequest} from "../api/generated/model";
import {QuestionInputFactory} from "../components/questions/QuestionInputFactory.tsx";
import {useAuth} from "../auth/AuthContext.tsx";


export type SubmissionFormValues = {
    [questionId: string]: string | number[];
};

export const TakePollPage = () => {
    const { pollId } = useParams();
    const id = Number(pollId);
    const [isSuccess, setIsSuccess] = useState(false);

    const navigate = useNavigate();

    const { isAdmin } = useAuth();

    const { data: poll, isLoading, error } = useGetPoll(id);
    const { mutateAsync: submitPoll, isPending: isSubmitting } = useCreateSubmission();

    const { control, handleSubmit } = useForm<SubmissionFormValues>();

    const onSubmit = async (data: SubmissionFormValues) => {
        if (!poll?.questions) return;

        const request: SubmissionCreateRequest = {
            answers: []
        };

        poll.questions.forEach((question) => {
            if (!question.id) {
                throw new Error("Question ID can't be null")
            }

            const value = data[String(question.id)];

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
                    selectedChoiceId: Number(value as string)
                });
            } else if (question.dtype === 'multi-choice') {
                request.answers.push({
                    dtype: 'multi-choice',
                    questionId: question.id,
                    selectedChoiceIds: value as number[]
                });
            }
        });

        try {
            await submitPoll({ pollId: id, data: request });
            setIsSuccess(true);
        } catch (e) {
            console.error(e);
            alert('Ошибка при попытке отправить ответы');
        }
    };

    if (isLoading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
    if (error || !poll) return <Container sx={{ mt: 4 }}><Alert severity="error">Опрос не найден</Alert></Container>;
    if (poll.status === 'DRAFT') return (
        <Card sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
                Опрос ещё не начался
            </Typography>
            <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={() => navigate(`/polls/${id}/edit`)}
            >
                Перейти к редактированию
            </Button>
        </Card>
    )
    if (poll.status === 'FINISHED') return (
        <Card sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
                Опрос уже завершён
            </Typography>
            <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={() => navigate(`/polls/${id}/stats`)}
            >
                Просмотреть статистику
            </Button>
        </Card>
    );

    if ((isSuccess || poll.mySubmissionsCount > 0) && !isAdmin) {
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

    const sortedQuestions = [...(poll.questions || [])]
        .sort((a, b) => a.position - b.position);

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box mb={4}>
                <Typography variant="h3" gutterBottom>{poll.name}</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {poll.description}
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
        </Container>
    );
};