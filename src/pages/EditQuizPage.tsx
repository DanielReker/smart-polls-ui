import {useEffect, useState} from 'react';
import {useFieldArray, useForm} from 'react-hook-form';
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Divider,
    InputAdornment,
    TextField,
    Typography
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PlayCircle from "@mui/icons-material/PlayCircle";
import StopCircle from "@mui/icons-material/StopCircle";
import {useNavigate, useParams} from "react-router";
import {useQueryClient} from "@tanstack/react-query";

import {
    getGetQuizQueryKey,
    useAiGenerateQuestions,
    useFinishQuiz,
    useGetQuiz,
    useStartQuiz,
    useUpsertQuestions
} from "../api/generated";
import {
    type MultiChoiceQuestionDto,
    type QuizQuestionsUpsertRequest,
    type QuizResponse,
    QuizResponseStatus,
    type QuestionDtoVariant, type SingleChoiceQuestionDto, type TextQuestionDto
} from "../api/generated/model";
import {QuestionCard} from "../components/questions/QuestionCard.tsx";
import QuizStatus from "../components/QuizStatus.tsx";
import {QuizNavigation} from "../components/QuizNavigation.tsx";


function prepareChoiceQuestionForSave(
    question: SingleChoiceQuestionDto | MultiChoiceQuestionDto,
    index: number
): SingleChoiceQuestionDto | MultiChoiceQuestionDto {
    return {
        ...question,
        id: null,
        position: index,
        possibleChoices: question
            .possibleChoices
            ?.map((choice, choiceIndex: number) => ({
                ...choice,
                id: null,
                position: choiceIndex
            }))
    }
}

function prepareTextQuestionForSave(
    question: TextQuestionDto,
    index: number
): TextQuestionDto {
    return {
        ...question,
        id: null,
        position: index
    }
}

const prepareQuestionsForSave = (formData: QuizQuestionsUpsertRequest): QuestionDtoVariant[] => {
    return formData
        .questions
        .map((question, index) => {
            if (question.dtype === "text") {
                return prepareTextQuestionForSave(question, index);
            } else if (question.dtype === "single-choice"
                || question.dtype === "multi-choice") {
                return prepareChoiceQuestionForSave(question, index);
            } else {
                throw new Error("Unexpected question type");
            }
        });
};

const prepareQuestionsForForm = (questions: QuestionDtoVariant[]) => {
    const sortedQuestions = [...questions].sort((a, b) => a.position - b.position);
    return sortedQuestions.map(q => {
        if ('possibleChoices' in q && q.possibleChoices) {
            return {
                ...q,
                possibleChoices: [...q.possibleChoices].sort((a, b) => a.position - b.position)
            };
        }
        return q;
    });
};

export const EditQuizPage = () => {
    const { quizId: id } = useParams<{ quizId: string }>();

    if (!id) {
        throw new Error("Missing quizId param");
    }

    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [aiPrompt, setAiPrompt] = useState('');

    const { data: quiz, isLoading: isQuizLoading } = useGetQuiz(id);
    const { mutateAsync: saveQuestions, isPending: isSaving } = useUpsertQuestions();
    const { mutateAsync: generateAiQuestions, isPending: isGenerating } = useAiGenerateQuestions();

    const { mutateAsync: startQuiz, isPending: isStarting } = useStartQuiz({
        mutation: {
            onSuccess: (updatedQuizData) => {
                queryClient.setQueryData(getGetQuizQueryKey(id), updatedQuizData);
                navigate(`/quizzes/${id}/stats`);
            },
            onError: () => alert("Не удалось создать тест")
        }
    });

    const { mutateAsync: finishQuiz, isPending: isFinishing } = useFinishQuiz({
        mutation: {
            onSuccess: (updatedQuizData) => {
                queryClient.setQueryData(getGetQuizQueryKey(id), updatedQuizData);
            }
        }
    });

    const { control, handleSubmit, reset } = useForm<QuizQuestionsUpsertRequest>({
        defaultValues: { questions: [] }
    });

    const { fields, append, remove, move } = useFieldArray({
        control,
        name: "questions",
        keyName: 'fieldId'
    });

    useEffect(() => {
        if (quiz?.questions) {
            reset({ questions: prepareQuestionsForForm(quiz.questions) });
        }
    }, [quiz, reset]);

    const onManualSave = async (data: QuizQuestionsUpsertRequest) => {
        const questionsToSend = prepareQuestionsForSave(data);
        try {
            await saveQuestions({ quizId: id, data: { questions: questionsToSend } });
            // TODO: Add notification
            // alert('Вопросы успешно сохранены!');
        } catch (e) {
            console.error(e);
            alert('Ошибка при сохранении вопросов');
        }
    };

    const onAiGenerate = async (data: QuizQuestionsUpsertRequest) => {
        if (!aiPrompt.trim()) return;

        const questionsToSend = prepareQuestionsForSave(data);

        try {
            await saveQuestions({ quizId: id, data: { questions: questionsToSend } });

            const updatedQuiz: QuizResponse = await generateAiQuestions({
                quizId: id,
                data: { prompt: aiPrompt }
            });

            if (updatedQuiz.questions) {
                reset({ questions: prepareQuestionsForForm(updatedQuiz.questions) });
                setAiPrompt('');
            }
        } catch (e) {
            console.error(e);
            alert('Не удалось сгенерировать вопросы. Пожалуйста, попробуйте позже.');
        }
    };

    if (isQuizLoading) {
        return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
    }

    const isGlobalLoading = isSaving || isGenerating;
    const isDraft = quiz?.status === 'DRAFT';

    return (
        <Box maxWidth="md" mx="auto" pb={10}>
            <Box mb={3}>
                <Typography variant="h4" gutterBottom>{quiz?.name}</Typography>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <QuizStatus status={quiz?.status || QuizResponseStatus.DRAFT} />
                    {isDraft && (
                        <Button
                            variant='contained'
                            color="success"
                            endIcon={<PlayCircle />}
                            disabled={isStarting}
                            onClick={() => startQuiz({ quizId: id })}
                        >
                            {isStarting ? 'Запуск...' : 'Запустить тест'}
                        </Button>
                    )}
                    {quiz?.status === 'ACTIVE' && (
                        <Button
                            variant='contained'
                            color="warning"
                            endIcon={<StopCircle />}
                            disabled={isFinishing}
                            onClick={() => finishQuiz({ quizId: id })}
                        >
                            {isFinishing ? 'Завершение...' : 'Завершить тест'}
                        </Button>
                    )}
                </Box>

                <QuizNavigation quizId={id} status={quiz?.status} />
            </Box>

            {isDraft ? (
                <>
                    <Card sx={{ mb: 4, border: '1px dashed', borderColor: 'primary.main', bgcolor: '#f9faff' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                <AutoAwesomeIcon color="primary" />
                                <Typography variant="h6" color="primary">ИИ-ассистент</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                                Введите тему или инструкции (например, "Добавь 3 вопроса про потоки в Java")
                                и ИИ обновит ваш тест. Вопросы будут сохранены автоматически.
                            </Typography>

                            <Box display="flex" gap={2} alignItems="flex-start">
                                <TextField
                                    fullWidth
                                    multiline
                                    minRows={2}
                                    maxRows={6}
                                    placeholder="Пример: Сгенерируй тест для сбора фидбека от сотрудников по нашему последнему корпоративу. Он должен содержать около 5 вопросов"
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    disabled={isGlobalLoading}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <AutoAwesomeIcon fontSize="small" color="disabled"/>
                                                </InputAdornment>
                                            ),
                                        }
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleSubmit(onAiGenerate)}
                                    disabled={isGlobalLoading || !aiPrompt.trim()}
                                    sx={{ minWidth: 120, mt: 1 }}
                                >
                                    {isGenerating ? <CircularProgress size={24} color="inherit"/> : 'Сгенерировать'}
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>

                    <Divider sx={{ mb: 3 }} />

                    <form onSubmit={handleSubmit(onManualSave)}>
                        {fields.map((field, index) => (
                            <QuestionCard
                                key={field.fieldId}
                                index={index}
                                field={field}
                                control={control}
                                remove={remove}
                                move={move}
                                isFirst={index === 0}
                                isLast={index === fields.length - 1}
                            />
                        ))}

                        <Box sx={{ display: 'flex', gap: 2, mt: 3, mb: 10, flexWrap: 'wrap' }}>
                            <Button
                                variant="outlined"
                                startIcon={<AddCircleOutlineIcon />}
                                disabled={isGlobalLoading}
                                onClick={() => append({
                                    dtype: 'text', name: '', isRequired: true, position: 0,
                                    maxLength: 1000
                                })}
                            >
                                Текст
                            </Button>

                            <Button
                                variant="outlined"
                                startIcon={<AddCircleOutlineIcon />}
                                disabled={isGlobalLoading}
                                onClick={() => append({
                                    dtype: 'single-choice', name: '', isRequired: true, position: 0,
                                    possibleChoices: []
                                })}
                            >
                                Одиночный выбор
                            </Button>

                            <Button
                                variant="outlined"
                                startIcon={<AddCircleOutlineIcon />}
                                disabled={isGlobalLoading}
                                onClick={() => append({
                                    dtype: 'multi-choice', name: '', isRequired: true, position: 0,
                                    possibleChoices: []
                                })}
                            >
                                Множественный выбор
                            </Button>
                        </Box>

                        <Box
                            sx={{
                                position: 'fixed', bottom: 0, left: 0, right: 0,
                                p: 2, bgcolor: 'background.paper', borderTop: '1px solid #ddd',
                                display: 'flex', justifyContent: 'center', zIndex: 1000,
                                boxShadow: '0px -2px 10px rgba(0,0,0,0.1)'
                            }}
                        >
                            <Button type="submit" variant="contained" size="large" disabled={isSaving} sx={{ width: 300 }}>
                                {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                            </Button>
                        </Box>
                    </form>
                </>
            ) : (
                <Card sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                        Тест активен, редактирование недоступно
                    </Typography>
                    <Button
                        variant="contained"
                        sx={{ mt: 2 }}
                        onClick={() => navigate(`/quizzes/${id}/stats`)}
                    >
                        Просмотр статистики
                    </Button>
                </Card>
            )}
        </Box>
    );
};