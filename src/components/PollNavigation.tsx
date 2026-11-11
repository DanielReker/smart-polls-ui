import {Paper, Tab, Tabs} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import BarChartIcon from '@mui/icons-material/BarChart';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import {matchPath, useLocation, useNavigate} from "react-router";
import type {SyntheticEvent} from "react";

interface PollNavigationProps {
    pollId: string;
    status?: 'DRAFT' | 'ACTIVE' | 'FINISHED';
}

export const PollNavigation = ({ pollId, status }: PollNavigationProps) => {
    const navigate = useNavigate();
    const location = useLocation();

    if (!status) return null;

    let currentTab: boolean | string = false;
    if (matchPath('/polls/:id/edit', location.pathname)) currentTab = 'edit';
    else if (matchPath('/polls/:id/stats', location.pathname)) currentTab = 'stats';
    else if (matchPath('/polls/:id', location.pathname)) currentTab = 'take';

    const handleChange = (_: SyntheticEvent, newValue: string) => {
        if (newValue === 'edit') navigate(`/polls/${pollId}/edit`);
        else if (newValue === 'stats') navigate(`/polls/${pollId}/stats`);
        else if (newValue === 'take') navigate(`/polls/${pollId}`);
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
                    label={status === 'DRAFT' ? "Предпросмотр" : "Ссылка на опрос"}
                    value="take"
                />
            </Tabs>
        </Paper>
    );
};