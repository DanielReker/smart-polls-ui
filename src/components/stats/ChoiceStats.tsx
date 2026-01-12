import type {MultiChoiceQuestionStatsDto, SingleChoiceQuestionStatsDto} from "../../api/model";
import {Box, Card, CardContent, Divider, LinearProgress, Stack, Typography} from "@mui/material";

export const ChoiceStats = ({stats, title, questionData}: {
    stats: SingleChoiceQuestionStatsDto | MultiChoiceQuestionStatsDto;
    title: string,
    questionData: any
}) => {
    const totalAnswers = stats.answerCount || 0;

    const sortedChoices = [...(stats.choiceStats || [])].sort((a, b) => b.count - a.count);

    return (
        <Card sx={{height: '100%'}}>
            <CardContent>
                <Typography variant="h6" gutterBottom>{title}</Typography>
                <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    Total answers: {totalAnswers}
                </Typography>
                <Divider sx={{mb: 2}}/>

                <Stack spacing={2}>
                    {sortedChoices.map((choice) => {
                        const percent = totalAnswers > 0 ? Math.round((choice.count / totalAnswers) * 100) : 0;

                        return (
                            <Box key={choice.id}>
                                <Box display="flex" justifyContent="space-between" gap={4} mb={0.5}>
                                    <Typography variant="body2" sx={{fontWeight: 500}}>
                                        {questionData?.possibleChoices.find((c: {
                                                id: number | undefined;
                                            }) => c.id === choice.id)?.name ||
                                            `Option #${choice.id}`}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {choice.count} ({percent}%)
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={percent}
                                    sx={{
                                        height: 10,
                                        borderRadius: 5,
                                        backgroundColor: '#f0f0f0',
                                        '& .MuiLinearProgress-bar': {
                                            borderRadius: 5,
                                            backgroundColor: percent > 0 ? 'primary.main' : 'transparent'
                                        }
                                    }}
                                />
                            </Box>
                        );
                    })}
                    {sortedChoices.length === 0 && (
                        <Typography variant="body2" color="text.secondary" align="center">
                            No options
                        </Typography>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
};