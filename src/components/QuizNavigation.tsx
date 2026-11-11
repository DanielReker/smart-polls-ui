import {Paper, Tab, Tabs} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import BarChartIcon from '@mui/icons-material/BarChart';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import {matchPath, useLocation, useNavigate} from "react-router";
import type {SyntheticEvent} from "react";

interface QuizNavigationProps {
    quizId: string;
    status?: 'DRAFT' | 'ACTIVE' | 'FINISHED';
}

export const QuizNavigation = ({ quizId, status }: QuizNavigationProps) => {
    const navigate = useNavigate();
    const location = useLocation();

    if (!status) return null;

    let currentTab: boolean | string = false;
    if (matchPath('/quizzes/:id/edit', location.pathname)) currentTab = 'edit';
    else if (matchPath('/quizzes/:id/stats', location.pathname)) currentTab = 'stats';
    else if (matchPath('/quizzes/:id', location.pathname)) currentTab = 'take';

    const handleChange = (_: SyntheticEvent, newValue: string) => {
        if (newValue === 'edit') navigate(`/quizzes/${quizId}/edit`);
        else if (newValue === 'stats') navigate(`/quizzes/${quizId}/stats`);
        else if (newValue === 'take') navigate(`/quizzes/${quizId}`);
    };

    return (
        <Paper sx={{ mb: 3 }} elevation={1}>
            <Tabs
                value={currentTab}
                onChange={handleChange}
                variant="fullWidth"
                indicatorColor="primary"
                textColor="primary"
            >
                {(status === 'DRAFT' || currentTab === 'edit') && (
                    <Tab
                        icon={<EditIcon />}
                        label="Редактор"
                        value="edit"
                        disabled={status !== 'DRAFT'} // Можно смотреть, но с disabled визуально понятнее
                    />
                )}

                {(status === 'ACTIVE' || status === 'FINISHED' || currentTab === 'stats') && (
                    <Tab
                        icon={<BarChartIcon />}
                        label="Статистика"
                        value="stats"
                    />
                )}

                <Tab
                    icon={<HowToVoteIcon />}
                    label={status === 'DRAFT' ? "Предпросмотр" : "Ссылка на тест"}
                    value="take"
                />
            </Tabs>
        </Paper>
    );
};