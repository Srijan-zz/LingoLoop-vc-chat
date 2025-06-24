import React from 'react'
import { QueryClient,useQueryClient, useMutation } from '@tanstack/react-query';
import { signup } from '../config/api';


function useSignup() {
    const queryClient = useQueryClient();

    const {
        mutate: signupMutation,
        isPending,
        error,
    } = useMutation({
        mutationFn: signup,//function is in api.js in config

        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),//to refetch authUser as we'll have logged in token cookie now

    });

    return { isPending, error, signupMutation }
}

export default useSignup