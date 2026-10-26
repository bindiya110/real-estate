import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import favoriteService from '../services/favoriteService';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import queryKeys from './queryKeys';

/** Favorite ids for the signed-in user plus an optimistic toggle. Guests are sent to login. */
export default function useFavorites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  const { data } = useQuery({
    queryKey: queryKeys.favorites.ids,
    queryFn: favoriteService.ids,
    enabled: Boolean(user),
    select: (res) => new Set(res.data),
    staleTime: 60_000,
  });
  const ids = data ?? new Set();

  const mutation = useMutation({
    mutationFn: ({ id, add }) => (add ? favoriteService.add(id) : favoriteService.remove(id)),
    onMutate: async ({ id, add }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.favorites.ids });
      const previous = queryClient.getQueryData(queryKeys.favorites.ids);
      queryClient.setQueryData(queryKeys.favorites.ids, (old) => {
        const list = new Set(old?.data ?? []);
        if (add) list.add(id);
        else list.delete(id);
        return { ...(old ?? {}), data: [...list] };
      });
      return { previous };
    },
    onError: (error, _vars, context) => {
      queryClient.setQueryData(queryKeys.favorites.ids, context?.previous);
      toast.error(getErrorMessage(error));
    },
    onSuccess: (_res, { add }) => toast.success(add ? 'Saved to favorites' : 'Removed from favorites'),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.my.stats });
    },
  });

  const toggle = (id) => {
    if (!user) {
      toast('Log in to save properties', { icon: '🔒' });
      navigate('/login', { state: { from: location } });
      return;
    }
    mutation.mutate({ id, add: !ids.has(id) });
  };

  return { isFavorite: (id) => ids.has(id), toggle, isPending: mutation.isPending };
}
