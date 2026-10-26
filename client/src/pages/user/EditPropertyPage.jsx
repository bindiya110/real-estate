import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import PageTitle from '../../components/dashboard/PageTitle';
import PropertyForm from '../../components/dashboard/PropertyForm';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import FormAlert from '../../components/forms/FormAlert';
import { EmptyState, ErrorState, PageLoader } from '../../components/common/States';
import propertyService from '../../services/propertyService';
import { useAuth } from '../../context/AuthContext';
import { propertyToForm } from '../../schemas/propertySchema';
import queryKeys from '../../hooks/queryKeys';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { reportSaveError } from './CreatePropertyPage';

export default function EditPropertyPage() {
  useDocumentTitle('Edit listing');
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({ queryKey: queryKeys.properties.byId(id), queryFn: () => propertyService.byId(id) });
  const property = data?.data;

  const mutation = useMutation({
    mutationFn: (payload) => propertyService.update(id, payload),
    onSuccess: (res) => {
      toast.success(res.message || 'Listing updated');
      queryClient.invalidateQueries({ queryKey: queryKeys.my.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
      navigate('/dashboard/properties');
    },
    onError: reportSaveError,
  });

  if (isLoading) return <PageLoader />;
  if ([400, 404].includes(error?.response?.status)) {
    return <EmptyState title="Listing not found" description="It may have been deleted." action={<Button to="/dashboard/properties">Back to my properties</Button>} />;
  }
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const ownerId = property.owner?._id ?? property.owner;
  if (String(ownerId) !== String(user?._id) && user?.role !== 'admin') {
    return <EmptyState title="You can’t edit this listing" description="Only the owner can edit a listing." action={<Button to="/dashboard/properties">Back to my properties</Button>} />;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageTitle title="Edit listing" description={property.title} actions={<StatusBadge status={property.status} />} />
      {property.status === 'rejected' && property.rejectionReason && (
        <FormAlert className="mb-6">This listing was rejected: {property.rejectionReason}. Update it and resubmit for review.</FormAlert>
      )}
      {property.status === 'approved' && (
        <FormAlert tone="info" className="mb-6">This listing is live. Saving changes will send it back for a quick review before the update is published.</FormAlert>
      )}
      <PropertyForm
        initialValues={propertyToForm(property)}
        onSubmit={(payload, { saveAsDraft }) => mutation.mutate({ ...payload, saveAsDraft })}
        submitting={mutation.isPending}
        submitLabel={property.status === 'draft' ? 'Submit for approval' : 'Save & resubmit'}
      />
    </div>
  );
}
