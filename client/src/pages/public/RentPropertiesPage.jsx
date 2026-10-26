import PageHeader from '../../components/common/PageHeader';
import ListingBrowser from '../../components/search/ListingBrowser';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function RentPropertiesPage() {
  useDocumentTitle('Properties for rent');
  return (
    <>
      <PageHeader
        title="Properties for rent"
        description="Furnished and unfurnished homes and offices. All prices shown are monthly rent."
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Rent' }]}
      />
      <ListingBrowser listingType="rent" />
    </>
  );
}
