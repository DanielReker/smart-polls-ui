import type {TextQuestionStatsDto} from "../../api/generated/model";
import {Box, Card, CardContent, Divider, Typography} from "@mui/material";

export const TextStats = ({stats, title}: {
    stats: TextQuestionStatsDto;
    title: string;
}) => {
    return (
        <Card sx={{height: '100%', display: 'flex', flexDirection: 'column'}}>
            <CardContent sx={{flexGrow: 1}}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                        <Typography variant="h6" gutterBottom>{title}</Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                            Текстовые ответы: {stats.answerCount}
                        </Typography>
                    </Box>
                </Box>
                <Divider sx={{my: 2}}/>

                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    height="100%"
                    py={4}
                    color="text.secondary"
                >
                    {stats.answerCount === 0 && (
                        <Typography variant="body2">Ещё нет ответов</Typography>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};