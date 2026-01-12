import {type Control, Controller} from "react-hook-form";
import {
    Card,
    CardContent,
    Checkbox,
    FormControlLabel,
    FormGroup,
    FormHelperText,
    Radio,
    RadioGroup,
    TextField,
    Typography
} from "@mui/material";

interface InputFactoryProps {
    question: any;
    control: Control<any>;
}

export const QuestionInputFactory = ({question, control}: InputFactoryProps) => {
    const {dtype, id, name, isRequired} = question;

    const rules = {
        required: isRequired ? 'This field is required' : false
    };

    return (
        <Card sx={{mb: 3}}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    {name} {isRequired && <span style={{color: 'red'}}>*</span>}
                </Typography>

                {dtype === 'text' && (
                    <Controller
                        name={String(id)}
                        control={control}
                        rules={{
                            ...rules,
                            maxLength: {
                                value: question.maxLength || 2000,
                                message: `Max length: ${question.maxLength} symbols`
                            }
                        }}
                        render={({field, fieldState}) => (
                            <TextField
                                {...field}
                                label="Your answer"
                                multiline
                                rows={3}
                                fullWidth
                                error={!!fieldState.error}
                                helperText={fieldState.error?.message}
                            />
                        )}
                    />
                )}

                {dtype === 'single-choice' && (
                    <Controller
                        name={String(id)}
                        control={control}
                        rules={rules}
                        render={({field, fieldState}) => (
                            <>
                                <RadioGroup {...field}>
                                    {question.possibleChoices?.map((opt: any) => (
                                        <FormControlLabel
                                            key={opt.id}
                                            value={opt.id}
                                            control={<Radio/>}
                                            label={opt.name}
                                        />
                                    ))}
                                </RadioGroup>
                                {fieldState.error && (
                                    <FormHelperText error>{fieldState.error.message}</FormHelperText>
                                )}
                            </>
                        )}
                    />
                )}

                {dtype === 'multi-choice' && (
                    <Controller
                        name={String(id)}
                        control={control}
                        rules={{
                            validate: (value: any) => {
                                if (isRequired && (!value || value.length === 0)) {
                                    return 'Select at least one option';
                                }
                                return true;
                            }
                        }}
                        defaultValue={[]}
                        render={({field: {value, onChange}, fieldState}) => {
                            const selectedIds = (value as number[]) || [];

                            const handleToggle = (optionId: number) => {
                                if (selectedIds.includes(optionId)) {
                                    onChange(selectedIds.filter(id => id !== optionId));
                                } else {
                                    onChange([...selectedIds, optionId]);
                                }
                            };

                            return (
                                <FormGroup>
                                    {question.possibleChoices?.map((opt: any) => (
                                        <FormControlLabel
                                            key={opt.id}
                                            control={
                                                <Checkbox
                                                    checked={selectedIds.includes(opt.id)}
                                                    onChange={() => handleToggle(opt.id)}
                                                />
                                            }
                                            label={opt.name}
                                        />
                                    ))}
                                    {fieldState.error && (
                                        <FormHelperText error>{fieldState.error.message}</FormHelperText>
                                    )}
                                </FormGroup>
                            );
                        }}
                    />
                )}
            </CardContent>
        </Card>
    );
};