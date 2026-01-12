import {useEffect} from 'react';
import {useFieldArray, useForm} from 'react-hook-form';
import {Box, Button, CircularProgress, Divider, Typography} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import {useParams} from "react-router";
import {
    getGetPollQueryKey,
    useFinishPoll,
    useGetPoll,
    useStartPoll,
    useUpsertQuestions
} from "../api/generated/poll-controller/poll-controller.ts";
import type {PollQuestionsUpsertRequest} from "../api/model";
import {QuestionCard} from "../components/questions/QuestionCard.tsx";
import {PlayCircle, StopCircle} from "@mui/icons-material";
import {useQueryClient} from "@tanstack/react-query";
import PollStatus from "../components/PollStatus.tsx";


export const EditPollPage = () => {
    const { pollId } = useParams();
    const id = Number(pollId);

    const queryClient = useQueryClient();

    const { data: poll, isLoading: isPollLoading } = useGetPoll(id);
    const { mutateAsync: saveQuestions, isPending: isSaving } = useUpsertQuestions();

    const pollStatusChangeMutationOptions = {
        mutation: {
            onSuccess: (updatedPollData) => {
                queryClient.setQueryData(
                    getGetPollQueryKey(id),
                    updatedPollData
                );
            },
            onError: () => {
                alert("Failed to start poll");
            }
        }
    };

    const { mutateAsync: startPoll, isPending: isStarting } = useStartPoll(pollStatusChangeMutationOptions);
    const { mutateAsync: finishPoll, isPending: isFinishing } = useFinishPoll(pollStatusChangeMutationOptions);

    const { control, handleSubmit, reset } = useForm<PollQuestionsUpsertRequest>({
        defaultValues: { questions: [] }
    });

    const { fields, append, remove, move } = useFieldArray({
        control,
        name: "questions"
    });

    useEffect(() => {
        if (poll?.questions) {
            const sortedQuestions = [...poll.questions].sort((a, b) => a.position - b.position);

            const preparedQuestions = sortedQuestions.map(q => {
                if ('possibleChoices' in q && q.possibleChoices) {
                    return {
                        ...q,
                        possibleChoices: [...q.possibleChoices].sort((a, b) => a.position - b.position)
                    };
                }
                return q;
            });

            reset({ questions: preparedQuestions });
        }
    }, [poll, reset]);

    const onSubmit = async (data: PollQuestionsUpsertRequest) => {
        const questionsToSend = data.questions.map((q: any, index) => ({
            ...q,
            id: null,
            position: index,

            possibleChoices: q.possibleChoices?.map((c: any, cIndex: number) => ({
                ...c,
                id: null,
                position: cIndex
            }))
        }));

        try {
            await saveQuestions({ pollId: id, data: { questions: questionsToSend } });
            alert('Questions saved successfully!');
        } catch (e) {
            console.error(e);
            alert('Error while saving questions');
        }
    };

    if (isPollLoading) {
        return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
    }

    return (
        <Box maxWidth="md" mx="auto" pb={10}>
            <Box display="flex" gap={2} alignItems="center">
                <Typography variant="h4" gutterBottom>{poll?.name}</Typography>
                <PollStatus status={poll?.status}/>
                {poll?.status === 'DRAFT' &&
                    <Button
                        sx={{ml: 3}}
                        variant='outlined'
                        endIcon={<PlayCircle/>}
                        disabled={isStarting}
                        onClick={() => startPoll({pollId: id})}
                    >{isStarting ? 'Starting...' : 'Start'}</Button>
                }
                {poll?.status === 'ACTIVE' &&
                    <Button
                        sx={{ml: 3}}
                        variant='outlined'
                        endIcon={<StopCircle/>}
                        disabled={isFinishing}
                        onClick={() => finishPoll({pollId: id})}
                    >{isFinishing ? 'Finishing...' : 'Finish'}</Button>
                }
            </Box>

            {poll?.status == 'DRAFT' && (<><Divider sx={{ mb: 3, mt: 2 }} />
                <form onSubmit={handleSubmit(onSubmit)}>
                    {fields.map((field, index) => (
                        <QuestionCard
                            key={field.id}
                            index={index}
                            field={field}
                            control={control}
                            remove={remove}
                            move={move}
                            isFirst={index === 0}
                            isLast={index === fields.length - 1}
                        />
                    ))}

                    <Box sx={{ display: 'flex', gap: 2, mt: 3, mb: 5, flexWrap: 'wrap' }}>
                        <Button
                            variant="outlined"
                            startIcon={<AddCircleOutlineIcon />}
                            onClick={() => append({
                                dtype: 'text',
                                name: '',
                                isRequired: true,
                                position: 0,
                                maxLength: 1000,
                                needAiSummary: true
                            } as any)}
                        >
                            Text
                        </Button>

                        <Button
                            variant="outlined"
                            startIcon={<AddCircleOutlineIcon />}
                            onClick={() => append({
                                dtype: 'single-choice',
                                name: '',
                                isRequired: true,
                                position: 0,
                                possibleChoices: []
                            } as any)}
                        >
                            Single Choice
                        </Button>

                        <Button
                            variant="outlined"
                            startIcon={<AddCircleOutlineIcon />}
                            onClick={() => append({
                                dtype: 'multi-choice',
                                name: '',
                                isRequired: true,
                                position: 0,
                                possibleChoices: []
                            } as any)}
                        >
                            Multi Choice
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
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={isSaving}
                            sx={{ width: 300 }}
                        >
                            {isSaving ? 'Saving...' : 'Save changes'}
                        </Button>
                    </Box>
                </form></>)}
        </Box>
    );
};