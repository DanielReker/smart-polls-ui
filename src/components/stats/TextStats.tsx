import type {TextQuestionStatsDto} from "../../api/model";
import {useSummarizeTextQuestion} from "../../api/generated/poll-controller/poll-controller.ts";
import {useState} from "react";
import {Box, Button, Card, CardContent, Chip, Divider, Tooltip, Typography} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

export const TextStats = ({stats, title, pollId, questionData}: {
    stats: TextQuestionStatsDto;
    title: string;
    pollId: number
    questionData: any
}) => {
    const {mutateAsync: runAiSummary, isPending} = useSummarizeTextQuestion();
    const [justTriggered, setJustTriggered] = useState(false);

    const handleAiClick = async () => {
        try {
            setJustTriggered(true);
            await runAiSummary({pollId, textQuestionId: stats.questionId});
            setTimeout(() => setJustTriggered(false), 2000);
        } catch (e) {
            console.error(e);
            setJustTriggered(false);
        }
    };

    const hasTags = stats.tags && stats.tags.length > 0;
    const sortedTags = [...(stats.tags || [])]
        .sort((a, b) => b.count - a.count);

    const needAiSummary = questionData?.needAiSummary || false;

    return (
        <Card sx={{height: '100%', display: 'flex', flexDirection: 'column'}}>
            <CardContent sx={{flexGrow: 1}}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                        <Typography variant="h6" gutterBottom>{title}</Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                            Text answers: {stats.answerCount}
                        </Typography>
                    </Box>
                    <Tooltip title="Summarize answers with AI">
                <span>
                    {needAiSummary && (
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<AutoAwesomeIcon/>}
                            onClick={handleAiClick}
                            disabled={isPending || justTriggered || stats.answerCount === 0}
                            color="secondary"
                        >
                            {justTriggered ? 'Summarizing...' : 'AI Summary'}
                        </Button>
                    )}
                </span>
                    </Tooltip>
                </Box>
                <Divider sx={{my: 2}}/>

                {hasTags ? (
                    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}>
                        {sortedTags.map((tag, idx) => (
                            <Chip
                                key={idx}
                                label={`${tag.tag} (${tag.count})`}
                                color="primary"
                                variant={idx < 3 ? "filled" : "outlined"}
                                sx={{
                                    fontWeight: idx < 3 ? 'bold' : 'normal'
                                }}
                            />
                        ))}
                    </Box>
                ) : (
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        height="100%"
                        py={4}
                        color="text.secondary"
                    >
                        {stats.answerCount === 0 ? (
                            <Typography variant="body2">No answers yet</Typography>
                        ) : (<>
                            {needAiSummary && (<>
                                <AutoAwesomeIcon sx={{fontSize: 40, mb: 1, opacity: 0.3}}/>
                                <Typography variant="body2">
                                    Press AI Summary button to generate key insights
                                </Typography>
                            </>)}
                        </>)}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};