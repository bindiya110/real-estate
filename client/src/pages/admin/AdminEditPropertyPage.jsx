import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import PageTitle from '../../components/dashboard/PageTitle';
import PropertyForm from '../../components/dashboard/PropertyForm';
import StatusBadge from '../../components/common/StatusBadge';
import FormAlert from '../../components/forms/FormAlert';
import { ErrorState, PageLoader } from '../../components/common/States';
import adminService from '../../services/adminService';
import { propertyToForm } from '../../schemas/propertySchema';
import queryKeys from '../../hooks/queryKeys';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { reportSaveError } from '../user/CreatePropertyPage';

export default function AdminEditPropertyPage() {
  useDocumentTitle('Edit listing');
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: queryKeys.admin.property(id), queryFn: () => adminService.property(id) });
  const property = data?.data;

  const mutation = useMutation({
    mutationFn: (payload) => adminService.updateProperty(id, payload),
    onSuccess: (res) => {
      toast.success(res.message || 'Listing updated');
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
      navigate('/admin/properties');
    },
    onError: reportSaveError,
  });

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="mx-auto max-w-4xl">
      <PageTitle title="Edit listing" description={`Owner: ${property.owner?.name ?? 'Unknown'} (${property.owner?.email ?? ''})`} actions={<StatusBadge status={property.status} />} />
      <FormAlert tone="info" className="mb-6">Admin edits keep the listing’s current status. Use approve/reject on the properties list to change it.</FormAlert>
      <PropertyForm
        initialValues={propertyToForm(property)}
        onSubmit={(payload) => mutation.mutate(payload)}
        submitting={mutation.isPending}
        submitLabel="Save changes"
        allowDraft={false}
      />
    </div>
  );
}
