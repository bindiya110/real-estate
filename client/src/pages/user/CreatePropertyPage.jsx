import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import PageTitle from '../../components/dashboard/PageTitle';
import PropertyForm from '../../components/dashboard/PropertyForm';
import propertyService from '../../services/propertyService';
import { getErrorMessage, getFieldErrors } from '../../services/api';
import queryKeys from '../../hooks/queryKeys';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export function reportSaveError(err) {
  const fields = Object.entries(getFieldErrors(err));
  toast.error(fields.length ? `${getErrorMessage(err)}: ${fields.map(([f, m]) => `${f} - ${m}`).join('; ')}` : getErrorMessage(err), { duration: 6000 });
}

export default function CreatePropertyPage() {
  useDocumentTitle('Add listing');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: propertyService.create,
    onSuccess: (res) => {
      toast.success(res.message || 'Listing saved');
      queryClient.invalidateQueries({ queryKey: queryKeys.my.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
      navigate('/dashboard/properties');
    },
    onError: reportSaveError,
  });

  return (
    <div className="mx-auto max-w-4xl">
      <PageTitle title="List a property" description="Complete each step. You can save a draft at any time and finish later." />
      <PropertyForm onSubmit={(payload, { saveAsDraft }) => mutation.mutate({ ...payload, saveAsDraft })} submitting={mutation.isPending} />
    </div>
  );
}
