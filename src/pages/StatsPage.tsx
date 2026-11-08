import {Box, Button, Chip, Container, Grid, Skeleton, Stack, Typography} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import {useGetPoll, useGetStats} from "../api/generated";
import {Link, useParams} from "react-router";
import {TextStats} from "../components/stats/TextStats.tsx";
import {ChoiceStats} from "../components/stats/ChoiceStats.tsx";
import {PollResponseStatus} from "../api/generated/model";


export const StatsPage = () => {
    const { pollId } = useParams();
    const id = Number(pollId);

    const { data: statsData, isLoading, isError } = useGetStats(id, {
        query: {
            refetchInterval: 2000,
            refetchIntervalInBackground: true
        }
    });

    const { data: pollData } = useGetPoll(id);

    const getQuestionTitle = (qId: number) => {
        return pollData?.questions?.find((q: any) => q.id === qId)?.name || `Вопрос №${qId}`;
    };

    if (isLoading && !statsData) {
        return (
            <Container sx={{ mt: 4 }}>
                <Skeleton variant="text" width="40%" height={40} />
                <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
                <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
            </Container>
        );
    }

    if (isError || !statsData) {
        return <Typography color="error" align="center" mt={4}>Не удалось загрузить статистику</Typography>;
    }

    const totalRespondents = statsData.submissionsCount;

    return (
        <Box sx={{ pb: 10 }}>
            <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 4, mb: 4, borderRadius: 2, boxShadow: 3 }}>
                <Container>
                    <Button
                        component={Link} to={`/`}
                        startIcon={<ArrowBackIcon />}
                        sx={{ color: 'white', opacity: 0.8, mb: 1 }}
                    >
                        Домашняя страница
                    </Button>
                    <Typography variant="h4" fontWeight="bold">
                        {pollData?.name || 'Результаты опроса'}
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center" mt={1}>
                        <Chip
                            icon={<PersonIcon />}
                            label={`${totalRespondents} ответов`}
                            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '& .MuiChip-icon': { color: 'white' } }}
                        />
                        <Chip
                            label={getStatusName(pollData?.status || PollResponseStatus.DRAFT)}
                            color={pollData?.status === 'ACTIVE' ? 'success' : 'default'}
                            size="small"
                        />
                    </Stack>
                </Container>
            </Box>

            <Container>
                <Grid container spacing={3}>
                    {statsData.stats.map((statItem: any) => {
                        const title = getQuestionTitle(statItem.questionId);
                        const type = statItem.dtype;

                        const questionData = (pollData
                                ?.questions
                                ?.find(question =>
                                    question.id == statItem.questionId))
                            || null;

                        return (
                            <Grid size={{ xs: 12, md: 6 }} key={statItem.questionId}>
                                {type === 'text' ? (
                                    <TextStats
                                        stats={statItem}
                                        title={title}
                                    />
                                ) : (
                                    <ChoiceStats
                                        stats={statItem}
                                        title={title}
                                        questionData={questionData}
                                    />
                                )}
                            </Grid>
                        );
                    })}
                </Grid>
            </Container>
        </Box>
    );
};

function getStatusName(status: PollResponseStatus): string {
    switch (status) {
        case "DRAFT": return "ЧЕРНОВИК";
        case "ACTIVE": return "АКТИВЕН";
        case "FINISHED": return "ЗАВЕРШЁН";
    }
}