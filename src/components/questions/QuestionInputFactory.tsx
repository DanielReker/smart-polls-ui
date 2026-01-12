import {type Control, Controller} from "react-hook-form";
import {
    Alert, Box,
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
import type {FormValues} from "../../pages/TakePollPage.tsx";

interface InputFactoryProps {
    question: any;
    control: Control<FormValues>;
}

export const QuestionInputFactory = ({question, control}: InputFactoryProps) => {
    const {dtype, id, name, isRequired} = question;

    const rules = {
        required: isRequired ? 'This field is required' : false
    };

    const renderContent = () => {
        switch (dtype) {
            case 'text':
                return (
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
                );

            case 'single-choice':
                return (
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
                );

            case 'multi-choice':
                return (
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
                );

            default:
                return <Alert severity="error">Unknown question type: {dtype}</Alert>;
        }
    };

    return (
        <Card sx={{mb: 3}}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    {name} {isRequired && <span style={{color: 'red'}}>*</span>}
                </Typography>
                {renderContent()}
            </CardContent>
        </Card>
    );
};