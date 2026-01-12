import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {Alert, Box, Button, CircularProgress, Container, Typography} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import {Link, useParams} from "react-router";
import {useCreateSubmission, useGetPoll} from "../api/generated/poll-controller/poll-controller.ts";
import type {SubmissionCreateRequest} from "../api/model";
import {QuestionInputFactory} from "../components/questions/QuestionInputFactory.tsx";
import {useAuth} from "../auth/AuthContext.tsx";


export type FormValues = {
    [questionId: number]: any;
};

export const TakePollPage = () => {
    const { pollId } = useParams();
    const id = Number(pollId);
    const [isSuccess, setIsSuccess] = useState(false);

    const { isAdmin } = useAuth();

    const { data: poll, isLoading, error } = useGetPoll(id);
    const { mutateAsync: submitPoll, isPending: isSubmitting } = useCreateSubmission();

    const { control, handleSubmit } = useForm<FormValues>();

    const onSubmit = async (data: FormValues) => {
        if (!poll?.questions) return;

        const answersToSend: any[] = [];

        poll.questions.forEach((q: any) => {
            const value = data[q.id];

            if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
                return;
            }

            if (q.dtype === 'text') {
                answersToSend.push({
                    dtype: 'text',
                    questionId: q.id,
                    value: value
                });
            } else if (q.dtype === 'single-choice') {
                answersToSend.push({
                    dtype: 'single-choice',
                    questionId: q.id,
                    selectedChoiceId: Number(value)
                });
            } else if (q.dtype === 'multi-choice') {
                answersToSend.push({
                    dtype: 'multi-choice',
                    questionId: q.id,
                    selectedChoiceIds: value
                });
            }
        });

        const payload: SubmissionCreateRequest = {
            answers: answersToSend
        };

        try {
            await submitPoll({ pollId: id, data: payload });
            setIsSuccess(true);
        } catch (e) {
            console.error(e);
            alert('Error while trying to submit answers');
        }
    };

    if (isLoading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
    if (error || !poll) return <Container sx={{ mt: 4 }}><Alert severity="error">Poll not found</Alert></Container>;
    if (poll.status === 'DRAFT') return <Container sx={{ mt: 4 }}><Alert severity="error">Poll is not started yet</Alert></Container>;
    if (poll.status === 'FINISHED') return <Container sx={{ mt: 4 }}><Alert severity="error">Poll is already finished</Alert></Container>;

    if ((isSuccess || poll.mySubmissionsCount > 0) && !isAdmin) {
        return (
            <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
                <CheckCircleOutlineIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
                <Typography variant="h4" gutterBottom>Thank you!</Typography>
                <Typography variant="body1" color="text.secondary">
                    Successfully submitted your answers
                </Typography>
                <Button component={Link} to="/" variant="contained" sx={{ mt: 2 }}>
                    Homepage
                </Button>
            </Container>
        );
    }

    const sortedQuestions = [...(poll.questions || [])].sort((a: any, b: any) => a.position - b.position);

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box mb={4}>
                <Typography variant="h3" gutterBottom>{poll.name}</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {poll.description}
                </Typography>
            </Box>

            <form onSubmit={handleSubmit(onSubmit)}>
                {sortedQuestions.map((q: any) => (
                    <QuestionInputFactory
                        key={q.id}
                        question={q}
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
                        Submit answers
                    </Button>
                </Box>
            </form>
        </Container>
    );
};