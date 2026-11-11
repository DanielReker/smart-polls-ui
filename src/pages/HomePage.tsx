import {Box, Button, List, ListItem, ListItemText, Paper, Typography} from '@mui/material';
import {Link} from "react-router";
import {useGetMyQuizzes} from "../api/generated";
import QuizStatus from "../components/QuizStatus.tsx";

export const HomePage = () => {
    const { data: myQuizzes } = useGetMyQuizzes();

    return (
        <div>
            <Typography variant="h4" gutterBottom>Мои тесты</Typography>

            <Button variant="contained" component={Link} to="/create" sx={{ mb: 3 }}>
                Создать новый тест
            </Button>

            {myQuizzes?.quizzes?.length === 0 ? (
                <Typography color="textSecondary">Вы ещё не создавали тесты</Typography>
            ) : (
                <List sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {myQuizzes?.quizzes?.map((quiz) => (
                        <Paper key={quiz.id}>
                            <ListItem divider>
                                <ListItemText
                                    primary={<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                        {`${quiz.name || 'Quiz'}`}
                                        <QuizStatus status={quiz.status}/>
                                    </Box>}
                                    secondary={quiz?.description}
                                />
                                {quiz?.status === 'DRAFT' && <Button component={Link} to={`/quizzes/${quiz.id}/edit`}>Редактировать</Button>}
                                {quiz?.status === 'ACTIVE' && <Button component={Link} to={`/quizzes/${quiz.id}`} sx={{ ml: 1 }}>Ответить</Button>}
                                {(quiz?.status === 'ACTIVE' || quiz?.status === 'FINISHED') && <Button component={Link} to={`/quizzes/${quiz.id}/stats`} sx={{ ml: 1 }}>Статистика</Button>}
                            </ListItem>
                        </Paper>
                    ))}
                </List>
            )}
        </div>
    );
};