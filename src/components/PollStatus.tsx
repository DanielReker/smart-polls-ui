import {Box} from "@mui/material";
import type {PollResponseStatus} from "../api/generated/model";

interface PollStatusProps {
    status: PollResponseStatus;
}

const PollStatus = (props: PollStatusProps) => {
    return (
        <Box
            sx={{
                bgcolor: 'primary.main', color: 'white', px: 1, borderRadius: 1,
                typography: 'caption', fontWeight: 'bold'
            }}
        >
            {getStatusName(props.status)}
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

export default PollStatus;