import {type Control, Controller, useFieldArray, type UseFormSetValue, useWatch} from "react-hook-form";
import {Box, Button, Checkbox, IconButton, Radio, TextField, Tooltip, Typography} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import type {QuizQuestionsUpsertRequest} from "../../api/generated/model";

interface OptionsEditorProps {
    nestIndex: number;
    control: Control<QuizQuestionsUpsertRequest>;
    setValue: UseFormSetValue<QuizQuestionsUpsertRequest>;
    dtype: 'single-choice' | 'multi-choice';
}

export const ChoiceOptionsEditor = ({nestIndex, control, setValue, dtype}: OptionsEditorProps) => {
    const {fields, append, remove, move} = useFieldArray({
        control,
        name: `questions.${nestIndex}.possibleChoices`,
        keyName: 'fieldId'
    });

    const choices = useWatch({
        control,
        name: `questions.${nestIndex}.possibleChoices`
    }) ?? [];

    const isSingleChoice = dtype === 'single-choice';

    const handleSelectCorrect = (selectedIndex: number) => {
        fields.forEach((_, idx) => {
            setValue(`questions.${nestIndex}.possibleChoices.${idx}.isCorrect`, idx === selectedIndex, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true
            });
        });
    };

    const hasCorrectChoice = choices.some(c => c?.isCorrect);

    return (
        <Box sx={{mt: 2, pl: 2, borderLeft: '2px solid #eee'}}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle2">Варианты ответа:</Typography>
                <Typography variant="caption" color="text.secondary">
                    {isSingleChoice
                        ? "Выберите один правильный ответ"
                        : "Отметьте правильные варианты ответа"}
                </Typography>
            </Box>

            {fields.map((field, k) => (
                <Box key={field.fieldId} sx={{display: 'flex', alignItems: 'center', mb: 1, gap: 1}}>
                    <Typography variant="caption" color="text.secondary" sx={{width: 20}}>
                        {k + 1}.
                    </Typography>

                    <Tooltip title="Правильный ответ">
                        <span>
                            {isSingleChoice ? (
                                <Radio
                                    checked={Boolean(choices[k]?.isCorrect)}
                                    onChange={() => handleSelectCorrect(k)}
                                    size="small"
                                    color="success"
                                />
                            ) : (
                                <Controller
                                    name={`questions.${nestIndex}.possibleChoices.${k}.isCorrect`}
                                    control={control}
                                    render={({field: checkboxField}) => (
                                        <Checkbox
                                            checked={Boolean(checkboxField.value)}
                                            onChange={(e) => checkboxField.onChange(e.target.checked)}
                                            size="small"
                                            color="success"
                                        />
                                    )}
                                />
                            )}
                        </span>
                    </Tooltip>

                    <Controller
                        name={`questions.${nestIndex}.possibleChoices.${k}.name`}
                        control={control}
                        rules={{required: "Текст варианта обязателен"}}
                        render={({field: inputField, fieldState}) => (
                            <TextField
                                {...inputField}
                                value={inputField.value ?? ""}
                                size="small"
                                fullWidth
                                placeholder="Текст варианта"
                                error={!!fieldState.error}
                                helperText={fieldState.error?.message}
                            />
                        )}
                    />

                    <Tooltip title="Переместить вверх">
                        <span>
                            <IconButton size="small" onClick={() => move(k, k - 1)} disabled={k === 0}>
                                <ArrowUpwardIcon fontSize="small"/>
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="Переместить вниз">
                        <span>
                            <IconButton size="small" onClick={() => move(k, k + 1)} disabled={k === fields.length - 1}>
                                <ArrowDownwardIcon fontSize="small"/>
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="Удалить вариант">
                        <IconButton size="small" color="error" onClick={() => remove(k)}>
                            <DeleteIcon fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                </Box>
            ))}

            {fields.length > 0 && isSingleChoice && !hasCorrectChoice && (
                <Typography variant="caption" color="error" sx={{display: 'block', mb: 1}}>
                    Выберите один правильный вариант ответа
                </Typography>
            )}

            <Button
                startIcon={<AddCircleOutlineIcon/>}
                size="small"
                onClick={() => append({
                    name: '',
                    position: fields.length,
                    isCorrect: isSingleChoice && fields.length === 0
                })}
                sx={{mt: 1}}
            >
                Добавить вариант
            </Button>
        </Box>
    );
};