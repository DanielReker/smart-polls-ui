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

interface QuestionCardProps {
    index: number;
    field: any;
    control: Control<any>;
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
                            {dtype === 'text' && 'TEXT'}
                            {dtype === 'single-choice' && 'SINGLE'}
                            {dtype === 'multi-choice' && 'MULTI'}
                        </Box>
                        <Typography variant="h6">Question #{index + 1}</Typography>
                    </Box>

                    <Box>
                        <Tooltip title="Move up">
                <span>
                    <IconButton onClick={() => move(index, index - 1)} disabled={isFirst}>
                    <ArrowUpwardIcon/>
                    </IconButton>
                </span>
                        </Tooltip>
                        <Tooltip title="Move down">
                <span>
                    <IconButton onClick={() => move(index, index + 1)} disabled={isLast}>
                    <ArrowDownwardIcon/>
                    </IconButton>
                </span>
                        </Tooltip>
                        <Tooltip title="Remove question">
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
                        rules={{required: "Question text is required"}}
                        render={({field, fieldState}) => (
                            <TextField
                                {...field}
                                label="Question text"
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
                                label="Question description"
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
                                    label="Required"
                                />
                            )}
                        />

                        {dtype === 'text' && (
                            <Controller
                                name={`questions.${index}.needAiSummary`}
                                control={control}
                                render={({field}) => (
                                    <FormControlLabel
                                        control={<Switch {...field} checked={field.value} color="secondary"/>}
                                        label="AI Summary (Tags)"
                                    />
                                )}
                            />
                        )}
                    </Box>

                    {dtype === 'text' && (
                        <Controller
                            name={`questions.${index}.maxLength`}
                            control={control}
                            render={({field}) => (
                                <TextField {...field} label="Max answer length" type="number" sx={{width: 200}}/>
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