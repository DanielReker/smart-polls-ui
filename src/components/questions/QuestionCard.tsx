import {
    Box,
    Card,
    CardContent,
    Divider,
    FormControlLabel,
    IconButton,
    Stack,
    Switch,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DeleteIcon from "@mui/icons-material/Delete";
import {type Control, Controller, type UseFormSetValue} from "react-hook-form";
import {ChoiceOptionsEditor} from "./ChoiceOptionsEditor.tsx";
import {HintsEditor} from "./HintsEditor.tsx";
import type {QuizQuestionsUpsertRequest, QuestionDtoVariant} from "../../api/generated/model";

interface QuestionCardProps {
    index: number;
    field: QuestionDtoVariant;
    control: Control<QuizQuestionsUpsertRequest>;
    setValue: UseFormSetValue<QuizQuestionsUpsertRequest>;
    remove: (index: number) => void;
    move: (from: number, to: number) => void;
    isFirst: boolean;
    isLast: boolean;
}

export const QuestionCard = ({
    index,
    field,
    control,
    setValue,
    remove,
    move,
    isFirst,
    isLast
}: QuestionCardProps) => {
    const dtype = field.dtype;

    return (
        <Card sx={{mb: 2, position: 'relative'}}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box display="flex" gap={1} alignItems="center">
                        <Box
                            sx={{
                                bgcolor: 'primary.main', color: 'white', px: 1, borderRadius: 1,
                                typography: 'caption', fontWeight: 'bold'
                            }}
                        >
                            {dtype === 'text' && 'ТЕКСТ'}
                            {dtype === 'single-choice' && 'ОДИНОЧНЫЙ ВЫБОР'}
                            {dtype === 'multi-choice' && 'МНОЖЕСТВЕННЫЙ ВЫБОР'}
                        </Box>
                        <Typography variant="h6">Вопрос №{index + 1}</Typography>
                    </Box>

                    <Box>
                        <Tooltip title="Переместить вверх">
                            <span>
                                <IconButton onClick={() => move(index, index - 1)} disabled={isFirst}>
                                    <ArrowUpwardIcon/>
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="Переместить вниз">
                            <span>
                                <IconButton onClick={() => move(index, index + 1)} disabled={isLast}>
                                    <ArrowDownwardIcon/>
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="Удалить вопрос">
                            <IconButton color="error" onClick={() => remove(index)}>
                                <DeleteIcon/>
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                <Stack spacing={2}>
                    <Controller
                        name={`questions.${index}.name`}
                        control={control}
                        rules={{required: "Текст вопроса обязателен"}}
                        render={({field: nameField, fieldState}) => (
                            <TextField
                                {...nameField}
                                value={nameField.value ?? ""}
                                label="Текст вопроса"
                                fullWidth
                                error={!!fieldState.error}
                                helperText={fieldState.error?.message}
                            />
                        )}
                    />

                    <Controller
                        name={`questions.${index}.description`}
                        control={control}
                        render={({field: descField, fieldState}) => (
                            <TextField
                                {...descField}
                                value={descField.value ?? ""}
                                label="Описание вопроса"
                                fullWidth
                                multiline
                                minRows={1}
                                maxRows={3}
                                error={!!fieldState.error}
                                helperText={fieldState.error?.message}
                            />
                        )}
                    />

                    <Box display="flex" gap={3} alignItems="center" flexWrap="wrap">
                        <Controller
                            name={`questions.${index}.isRequired`}
                            control={control}
                            render={({field: requiredField}) => (
                                <FormControlLabel
                                    control={<Switch {...requiredField} checked={Boolean(requiredField.value)}/>}
                                    label="Обязателен"
                                />
                            )}
                        />

                        <Controller
                            name={`questions.${index}.maxScore`}
                            control={control}
                            rules={{
                                required: "Максимальный балл обязателен",
                                min: {value: 0, message: "Балл не может быть отрицательным"}
                            }}
                            render={({field: scoreField, fieldState}) => (
                                <TextField
                                    {...scoreField}
                                    value={scoreField.value ?? 1}
                                    onChange={(e) => scoreField
                                        .onChange(e.target.value === '' ? '' : Number(e.target.value))}
                                    type="number"
                                    label="Максимальный балл"
                                    slotProps={{htmlInput: {min: 0, step: 0.5}}}
                                    sx={{width: 200}}
                                    error={!!fieldState.error}
                                    helperText={fieldState.error?.message}
                                />
                            )}
                        />
                    </Box>

                    {dtype === 'text' && (
                        <Box display="flex" gap={2} flexDirection={{xs: 'column', sm: 'row'}}>
                            <Controller
                                name={`questions.${index}.maxLength`}
                                control={control}
                                render={({field: maxLenField}) => (
                                    <TextField
                                        {...maxLenField}
                                        value={maxLenField.value ?? 1000}
                                        onChange={(e) => maxLenField
                                            .onChange(e.target.value === '' ? null : Number(e.target.value))}
                                        label="Максимальная длина ответа"
                                        type="number"
                                        sx={{width: {xs: '100%', sm: 240}}}
                                    />
                                )}
                            />

                            <Controller
                                name={`questions.${index}.sampleCorrectAnswer`}
                                control={control}
                                render={({field: sampleField, fieldState}) => (
                                    <TextField
                                        {...sampleField}
                                        value={sampleField.value ?? ""}
                                        label="Пример правильного ответа"
                                        fullWidth
                                        error={!!fieldState.error}
                                        helperText={fieldState.error?.message}
                                    />
                                )}
                            />
                        </Box>
                    )}

                    {(dtype === 'single-choice' || dtype === 'multi-choice') && (
                        <ChoiceOptionsEditor
                            nestIndex={index}
                            control={control}
                            setValue={setValue}
                            dtype={dtype}
                        />
                    )}

                    <Divider />

                    <HintsEditor nestIndex={index} control={control} />
                </Stack>
            </CardContent>
        </Card>
    );
};