import {Box, Button, List, ListItem, ListItemText, Paper, Typography} from '@mui/material';
import {Link} from "react-router";
import {useGetMyPolls} from "../api/generated/poll-controller/poll-controller.ts";
import PollStatus from "../components/PollStatus.tsx";

export const HomePage = () => {
    const { data: myPolls } = useGetMyPolls();

    return (
        <div>
            <Typography variant="h4" gutterBottom>My polls</Typography>

            <Button variant="contained" component={Link} to="/create" sx={{ mb: 3 }}>
                Create new poll
            </Button>

            {myPolls?.polls?.length === 0 ? (
                <Typography color="textSecondary">You didn't create any poll yet</Typography>
            ) : (
                <List sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {myPolls?.polls?.map((poll) => (
                        <Paper>
                            <ListItem key={poll.id} divider>
                                <ListItemText
                                    primary={<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                        {`${poll.name || 'Poll'} #${poll.id}`}
                                        <PollStatus status={poll.status}/>
                                    </Box>}
                                    secondary={poll?.description}
                                />
                                {poll?.status === 'DRAFT' && <Button component={Link} to={`/polls/${poll.id}/edit`}>Edit</Button>}
                                {poll?.status === 'ACTIVE' && <Button component={Link} to={`/polls/${poll.id}`} sx={{ ml: 1 }}>Answer</Button>}
                                {(poll?.status === 'ACTIVE' || poll?.status === 'FINISHED') && <Button component={Link} to={`/polls/${poll.id}/stats`} sx={{ ml: 1 }}>Stats</Button>}
                            </ListItem>
                        </Paper>
                    ))}
                </List>
            )}
        </div>
    );
};