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
import type {SubmissionFormValues} from "../../pages/TakeQuizPage.tsx";
import type {QuestionDtoVariant} from "../../api/generated/model";

interface InputFactoryProps {
    question: QuestionDtoVariant;
    control: Control<SubmissionFormValues>;
}

export const QuestionInputFactory = ({question, control}: InputFactoryProps) => {
    const {dtype, id, name, isRequired} = question;

    if (!id) {
        throw new Error("Question ID can't be null");
    }

    const rules = {
        required: isRequired ? 'Это поле обязательно' : false
    };

    return (
        <Card sx={{mb: 3}}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    {name} {isRequired && <span style={{color: 'red'}}>*</span>}
                </Typography>

                {dtype === 'text' && (
                    <Controller
                        name={id}
                        control={control}
                        rules={{
                            ...rules,
                            maxLength: {
                                value: question.maxLength || 2000,
                                message: `Максимальная длина: ${question.maxLength} символов`
                            }
                        }}
                        render={({field, fieldState}) => (
                            <TextField
                                {...field}
                                label="Ваш ответ"
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
                        name={id}
                        control={control}
                        rules={rules}
                        render={({field, fieldState}) => (
                            <>
                                <RadioGroup
                                    {...field}
                                    value={field.value ?? ""}
                                >
                                    {question.possibleChoices?.map((opt) => (
                                        <FormControlLabel
                                            key={opt.id!}
                                            value={opt.id!}
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
                        name={id}
                        control={control}
                        rules={{
                            validate: (value) => {
                                if (isRequired && (!value || value.length === 0)) {
                                    return 'Выберите как минимум 1 вариант';
                                }
                                return true;
                            }
                        }}
                        defaultValue={[]}
                        render={({field: {value, onChange}, fieldState}) => {
                            const selectedIds = (value as string[]) || [];

                            const handleToggle = (optionId: string) => {
                                if (selectedIds.includes(optionId)) {
                                    onChange(selectedIds.filter(id => id !== optionId));
                                } else {
                                    onChange([...selectedIds, optionId]);
                                }
                            };

                            return (
                                <FormGroup>
                                    {question.possibleChoices?.map((choice) => (
                                        <FormControlLabel
                                            key={choice.id}
                                            control={
                                                <Checkbox
                                                    checked={selectedIds.includes(choice.id!)}
                                                    onChange={() => handleToggle(choice.id!)}
                                                />
                                            }
                                            label={choice.name}
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