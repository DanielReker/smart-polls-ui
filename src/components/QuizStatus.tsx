import {Box} from "@mui/material";
import type {QuizResponseStatus} from "../api/generated/model";

interface QuizStatusProps {
    status: QuizResponseStatus;
}

const QuizStatus = (props: QuizStatusProps) => {
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

function getStatusName(status: QuizResponseStatus): string {
    switch (status) {
        case "DRAFT": return "ЧЕРНОВИК";
        case "ACTIVE": return "АКТИВЕН";
        case "FINISHED": return "ЗАВЕРШЁН";
    }
}

export default QuizStatus;