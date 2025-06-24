import React from 'react'
import { QueryClient, useQueryClient,useMutation } from '@tanstack/react-query';
import { logout } from '../config/api';

function useLogout() {

  const queryClient = useQueryClient();
  const { mutate} = useMutation({
    mutationFn: logout,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  });

return {logoutMutation:mutate}
}

export default useLogout