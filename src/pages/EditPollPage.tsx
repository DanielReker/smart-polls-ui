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
    getGetPollQueryKey,
    useAiGenerateQuestions,
    useFinishPoll,
    useGetPoll,
    useStartPoll,
    useUpsertQuestions
} from "../api/generated";
import {type PollQuestionsUpsertRequest, type PollResponse, PollResponseStatus} from "../api/generated/model";
import {QuestionCard} from "../components/questions/QuestionCard.tsx";
import PollStatus from "../components/PollStatus.tsx";
import {PollNavigation} from "../components/PollNavigation.tsx";

const prepareQuestionsForSave = (formData: PollQuestionsUpsertRequest) => {
    return formData.questions.map((q: any, index) => ({
        ...q,
        id: null,
        position: index,
        possibleChoices: q.possibleChoices?.map((c: any, cIndex: number) => ({
            ...c,
            id: null,
            position: cIndex
        }))
    }));
};

const prepareQuestionsForForm = (questions: any[]) => {
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

export const EditPollPage = () => {
    const { pollId } = useParams();
    const id = Number(pollId);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [aiPrompt, setAiPrompt] = useState('');

    const { data: poll, isLoading: isPollLoading } = useGetPoll(id);
    const { mutateAsync: saveQuestions, isPending: isSaving } = useUpsertQuestions();
    const { mutateAsync: generateAiQuestions, isPending: isGenerating } = useAiGenerateQuestions();

    const { mutateAsync: startPoll, isPending: isStarting } = useStartPoll({
        mutation: {
            onSuccess: (updatedPollData) => {
                queryClient.setQueryData(getGetPollQueryKey(id), updatedPollData);
                navigate(`/polls/${id}/stats`);
            },
            onError: () => alert("Не удалось создать опрос")
        }
    });

    const { mutateAsync: finishPoll, isPending: isFinishing } = useFinishPoll({
        mutation: {
            onSuccess: (updatedPollData) => {
                queryClient.setQueryData(getGetPollQueryKey(id), updatedPollData);
            }
        }
    });

    const { control, handleSubmit, reset } = useForm<PollQuestionsUpsertRequest>({
        defaultValues: { questions: [] }
    });

    const { fields, append, remove, move } = useFieldArray({
        control,
        name: "questions",
        keyName: 'fieldId'
    });

    useEffect(() => {
        if (poll?.questions) {
            reset({ questions: prepareQuestionsForForm(poll.questions) });
        }
    }, [poll, reset]);

    const onManualSave = async (data: PollQuestionsUpsertRequest) => {
        const questionsToSend = prepareQuestionsForSave(data);
        try {
            await saveQuestions({ pollId: id, data: { questions: questionsToSend } });
            // TODO: Add notification
            // alert('Вопросы успешно сохранены!');
        } catch (e) {
            console.error(e);
            alert('Ошибка при сохранении вопросов');
        }
    };

    const onAiGenerate = async (data: PollQuestionsUpsertRequest) => {
        if (!aiPrompt.trim()) return;

        const questionsToSend = prepareQuestionsForSave(data);

        try {
            await saveQuestions({ pollId: id, data: { questions: questionsToSend } });

            const updatedPoll: PollResponse = await generateAiQuestions({
                pollId: id,
                data: { prompt: aiPrompt }
            });

            if (updatedPoll.questions) {
                reset({ questions: prepareQuestionsForForm(updatedPoll.questions) });
                setAiPrompt('');
            }
        } catch (e) {
            console.error(e);
            alert('Не удалось сгенерировать вопросы. Пожалуйста, попробуйте позже.');
        }
    };

    if (isPollLoading) {
        return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
    }

    const isGlobalLoading = isSaving || isGenerating;
    const isDraft = poll?.status === 'DRAFT';

    return (
        <Box maxWidth="md" mx="auto" pb={10}>
            <Box mb={3}>
                <Typography variant="h4" gutterBottom>{poll?.name}</Typography>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <PollStatus status={poll?.status || PollResponseStatus.DRAFT} />
                    {isDraft && (
                        <Button
                            variant='contained'
                            color="success"
                            endIcon={<PlayCircle />}
                            disabled={isStarting}
                            onClick={() => startPoll({ pollId: id })}
                        >
                            {isStarting ? 'Запуск...' : 'Запустить опрос'}
                        </Button>
                    )}
                    {poll?.status === 'ACTIVE' && (
                        <Button
                            variant='contained'
                            color="warning"
                            endIcon={<StopCircle />}
                            disabled={isFinishing}
                            onClick={() => finishPoll({ pollId: id })}
                        >
                            {isFinishing ? 'Завершение...' : 'Завершить опрос'}
                        </Button>
                    )}
                </Box>

                <PollNavigation pollId={id} status={poll?.status} />
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
                                и ИИ обновит ваш опрос. Вопросы будут сохранены автоматически.
                            </Typography>

                            <Box display="flex" gap={2} alignItems="flex-start">
                                <TextField
                                    fullWidth
                                    multiline
                                    minRows={2}
                                    maxRows={6}
                                    placeholder="Пример: Сгенерируй опрос для сбора фидбека от сотрудников по нашему последнему корпоративу. Он должен содержать около 5 вопросов"
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
                                } as any)}
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
                                } as any)}
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
                                } as any)}
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
                        Опрос активен, редактирование недоступно
                    </Typography>
                    <Button
                        variant="contained"
                        sx={{ mt: 2 }}
                        onClick={() => navigate(`/polls/${id}/stats`)}
                    >
                        Просмотр статистики
                    </Button>
                </Card>
            )}
        </Box>
    );
};