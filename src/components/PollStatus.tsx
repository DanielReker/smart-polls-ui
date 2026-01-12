import {Box} from "@mui/material";

interface PollStatusProps {
    status?: string;
}

const PollStatus = (props: PollStatusProps) => {
    return (
        <Box
            sx={{
                bgcolor: 'primary.main', color: 'white', px: 1, borderRadius: 1,
                typography: 'caption', fontWeight: 'bold'
            }}
        >
            {props.status || 'UNDEFINED'}
        </Box>
    );
};

export default PollStatus;