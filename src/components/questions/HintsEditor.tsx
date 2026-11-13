import {type Control, Controller, useFieldArray, useWatch} from "react-hook-form";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    IconButton,
    Stack,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import type {QuizQuestionsUpsertRequest} from "../../api/generated/model";

interface HintsEditorProps {
    nestIndex: number;
    control: Control<QuizQuestionsUpsertRequest>;
}

export const HintsEditor = ({nestIndex, control}: HintsEditorProps) => {
    const {fields, append, remove, move} = useFieldArray({
        control,
        name: `questions.${nestIndex}.hints`,
        keyName: 'fieldId'
    });

    const maxScoreRaw = useWatch({
        control,
        name: `questions.${nestIndex}.maxScore`
    });
    const maxScore = Number(maxScoreRaw) || 0;

    const hints = useWatch({
        control,
        name: `questions.${nestIndex}.hints`
    }) ?? [];

    const totalPenalty = hints.reduce((sum, h) => sum + (Number(h?.scorePenalty) || 0), 0);
    const minPossibleScore = Math.round((maxScore - totalPenalty) * 100) / 100;
    const isTotalScoreNegative = minPossibleScore < 0;

    return (
        <Box sx={{mt: 2, pl: 2, borderLeft: '2px solid #e0e0e0'}}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1} flexWrap="wrap" gap={1}>
                <Box display="flex" alignItems="center" gap={1}>
                    <LightbulbOutlinedIcon fontSize="small" color="warning" />
                    <Typography variant="subtitle2">Подсказки:</Typography>
                </Box>
                {fields.length > 0 && (
                    <Typography
                        variant="caption"
                        sx={{
                            color: isTotalScoreNegative ? 'error.main' : 'text.secondary',
                            fontWeight: isTotalScoreNegative ? 'bold' : 'normal'
                        }}
                    >
                        Итоговый балл после всех подсказок: {minPossibleScore}
                    </Typography>
                )}
            </Box>

            {fields.length > 0 && (
                <Stack spacing={1.5} mb={2}>
                    {fields.map((field, k) => {
                        const cumulativePenalty = hints
                            .slice(0, k + 1)
                            .reduce((sum, h) => sum + (Number(h?.scorePenalty) || 0), 0);
                        const scoreAfterRevealing = Math.round((maxScore - cumulativePenalty) * 100) / 100;
                        const isHintScoreNegative = scoreAfterRevealing < 0;

                        return (
                            <Card key={field.fieldId} variant="outlined" sx={{bgcolor: '#fafafa'}}>
                                <CardContent sx={{p: 1.5, '&:last-child': {pb: 1.5}}}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Chip label={`Подсказка №${k + 1}`} size="small" variant="outlined" />
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: isHintScoreNegative ? 'error.main' : 'text.secondary',
                                                    fontWeight: isHintScoreNegative ? 'bold' : 'normal'
                                                }}
                                            >
                                                Макс. балл после открытия: {scoreAfterRevealing}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Tooltip title="Переместить вверх">
                                                <span>
                                                    <IconButton size="small" onClick={() => move(k, k - 1)} disabled={k === 0}>
                                                        <ArrowUpwardIcon fontSize="small" />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                            <Tooltip title="Переместить вниз">
                                                <span>
                                                    <IconButton size="small" onClick={() => move(k, k + 1)} disabled={k === fields.length - 1}>
                                                        <ArrowDownwardIcon fontSize="small" />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                            <Tooltip title="Удалить подсказку">
                                                <IconButton size="small" color="error" onClick={() => remove(k)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Box>

                                    <Box display="flex" gap={2} flexDirection={{xs: 'column', sm: 'row'}}>
                                        <Controller
                                            name={`questions.${nestIndex}.hints.${k}.text`}
                                            control={control}
                                            rules={{required: "Текст подсказки обязателен"}}
                                            render={({field: textField, fieldState}) => (
                                                <TextField
                                                    {...textField}
                                                    value={textField.value ?? ""}
                                                    size="small"
                                                    fullWidth
                                                    label="Текст подсказки"
                                                    error={!!fieldState.error}
                                                    helperText={fieldState.error?.message}
                                                />
                                            )}
                                        />

                                        <Controller
                                            name={`questions.${nestIndex}.hints.${k}.scorePenalty`}
                                            control={control}
                                            rules={{
                                                required: "Штраф обязателен",
                                                min: {value: 0, message: "Штраф не может быть отрицательным"}
                                            }}
                                            render={({field: penaltyField, fieldState}) => (
                                                <TextField
                                                    {...penaltyField}
                                                    value={penaltyField.value ?? 0}
                                                    onChange={(e) => penaltyField.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                                                    size="small"
                                                    type="number"
                                                    label="Штраф к баллу"
                                                    slotProps={{htmlInput: {min: 0, step: 0.1}}}
                                                    sx={{width: {xs: '100%', sm: 180}}}
                                                    error={!!fieldState.error || isHintScoreNegative}
                                                    helperText={fieldState.error?.message || (isHintScoreNegative ? "Балл станет отрицательным" : undefined)}
                                                />
                                            )}
                                        />
                                    </Box>
                                </CardContent>
                            </Card>
                        );
                    })}
                </Stack>
            )}

            {isTotalScoreNegative && (
                <Alert severity="error" sx={{mb: 2}}>
                    Сумма штрафов за подсказки ({totalPenalty}) превышает максимальный балл вопроса ({maxScore}). Минимальный возможный балл не может быть меньше 0.
                </Alert>
            )}

            <Button
                startIcon={<AddCircleOutlineIcon />}
                size="small"
                onClick={() => append({
                    text: '',
                    scorePenalty: 0,
                    sequentialOrder: fields.length
                })}
            >
                Добавить подсказку
            </Button>
        </Box>
    );
};
