import {Box, Button, Chip, Container, Grid, Skeleton, Stack, Typography} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import {useGetPoll, useGetStats} from "../api/generated/poll-controller/poll-controller.ts";
import {Link, useParams} from "react-router";
import {TextStats} from "../components/stats/TextStats.tsx";
import {ChoiceStats} from "../components/stats/ChoiceStats.tsx";


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
        return pollData?.questions?.find((q: any) => q.id === qId)?.name || `Question #${qId}`;
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
        return <Typography color="error" align="center" mt={4}>Failed to load statistics</Typography>;
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
                        Homepage
                    </Button>
                    <Typography variant="h4" fontWeight="bold">
                        {pollData?.name || 'Poll results'}
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center" mt={1}>
                        <Chip
                            icon={<PersonIcon />}
                            label={`${totalRespondents} submissions`}
                            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '& .MuiChip-icon': { color: 'white' } }}
                        />
                        <Chip
                            label={pollData?.status}
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
                                        pollId={id}
                                        questionData={questionData}
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