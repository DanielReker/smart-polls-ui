import {type Control, Controller, useFieldArray} from "react-hook-form";
import {Box, Button, IconButton, TextField, Typography} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import type {QuizQuestionsUpsertRequest} from "../../api/generated/model";

interface OptionsEditorProps {
    nestIndex: number;
    control: Control<QuizQuestionsUpsertRequest>;
}

export const ChoiceOptionsEditor = ({nestIndex, control}: OptionsEditorProps) => {
    const {fields, append, remove, move} = useFieldArray({
        control,
        name: `questions.${nestIndex}.possibleChoices`,
        keyName: 'fieldId'
    });

    return (
        <Box sx={{mt: 2, pl: 2, borderLeft: '2px solid #eee'}}>
            <Typography variant="subtitle2" gutterBottom>Варианты:</Typography>

            {fields.map((field, k) => (
                <Box key={field.fieldId} sx={{display: 'flex', alignItems: 'center', mb: 1, gap: 1}}>
                    <Typography variant="caption" color="text.secondary" sx={{width: 20}}>
                        {k + 1}.
                    </Typography>

                    <Controller
                        name={`questions.${nestIndex}.possibleChoices.${k}.name`}
                        control={control}
                        rules={{required: "Текст варианта обязателен"}}
                        render={({field, fieldState}) => (
                            <TextField
                                {...field}
                                size="small"
                                fullWidth
                                placeholder="Текст варианта"
                                error={!!fieldState.error}
                                helperText={fieldState.error?.message}
                            />
                        )}
                    />

                    <IconButton size="small" onClick={() => move(k, k - 1)} disabled={k === 0}>
                        <ArrowUpwardIcon fontSize="small"/>
                    </IconButton>
                    <IconButton size="small" onClick={() => move(k, k + 1)} disabled={k === fields.length - 1}>
                        <ArrowDownwardIcon fontSize="small"/>
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => remove(k)}>
                        <DeleteIcon fontSize="small"/>
                    </IconButton>
                </Box>
            ))}

            <Button
                startIcon={<AddCircleOutlineIcon/>}
                size="small"
                onClick={() => append({
                    name: '',
                    position: 0
                })}
                sx={{mt: 1}}
            >
                Add option
            </Button>
        </Box>
    );
};