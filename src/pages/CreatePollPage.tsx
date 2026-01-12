import { useForm } from 'react-hook-form';
import { TextField, Button, Box, Typography } from '@mui/material';
import {useCreatePoll} from "../api/generated/poll-controller/poll-controller.ts";
import {useNavigate} from "react-router";

export const CreatePollPage = () => {
    const { register, handleSubmit } = useForm<{ name: string; description: string }>();
    const navigate = useNavigate();
    const { mutateAsync: createPoll } = useCreatePoll();

    const onSubmit = async (data: { name: string; description: string }) => {
        try {
            const newPoll = await createPoll({ data });
            navigate(`/polls/${newPoll.id}/edit`);
        } catch {
            alert(`Error while creating poll`);
        }
    };

    return (
        <Box maxWidth="sm" sx={{ mx: 'auto' }}>
            <Typography variant="h5" gutterBottom>New poll</Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
                <TextField fullWidth label="Name" {...register('name')} margin="normal" required />
                <TextField fullWidth label="Description" {...register('description')} margin="normal" multiline rows={3} />
                <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>Next</Button>
            </form>
        </Box>
    );
};