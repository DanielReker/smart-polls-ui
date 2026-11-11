import {
    Box,
    Card,
    CardContent,
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
import {type Control, Controller} from "react-hook-form";
import {ChoiceOptionsEditor} from "./ChoiceOptionsEditor.tsx";
import type {QuizQuestionsUpsertRequest, QuestionDtoVariant} from "../../api/generated/model";

interface QuestionCardProps {
    index: number;
    field: QuestionDtoVariant;
    control: Control<QuizQuestionsUpsertRequest>;
    remove: (index: number) => void;
    move: (from: number, to: number) => void;
    isFirst: boolean;
    isLast: boolean;
}

export const QuestionCard = ({index, field, control, remove, move, isFirst, isLast}: QuestionCardProps) => {
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
                        render={({field, fieldState}) => (
                            <TextField
                                {...field}
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
                        render={({field, fieldState}) => (
                            <TextField
                                {...field}
                                value={field.value ?? ""}
                                label="Описание вопроса"
                                fullWidth
                                error={!!fieldState.error}
                                helperText={fieldState.error?.message}
                            />
                        )}
                    />

                    <Box display="flex" gap={3}>
                        <Controller
                            name={`questions.${index}.isRequired`}
                            control={control}
                            render={({field}) => (
                                <FormControlLabel
                                    control={<Switch {...field} checked={field.value}/>}
                                    label="Обязателен"
                                />
                            )}
                        />
                    </Box>

                    {dtype === 'text' && (
                        <Controller
                            name={`questions.${index}.maxLength`}
                            control={control}
                            render={({field}) => (
                                <TextField
                                    {...field}
                                    value={field.value ?? 100} // TODO: Define default values instead
                                    label="Максимальная длина ответа"
                                    type="number"
                                    sx={{width: 200}}
                                />
                            )}
                        />
                    )}

                    {(dtype === 'single-choice' || dtype === 'multi-choice') && (
                        <ChoiceOptionsEditor nestIndex={index} control={control}/>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
};