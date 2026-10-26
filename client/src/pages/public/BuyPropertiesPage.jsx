import PageHeader from '../../components/common/PageHeader';
import ListingBrowser from '../../components/search/ListingBrowser';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function BuyPropertiesPage() {
  useDocumentTitle('Properties for sale');
  return (
    <>
      <PageHeader
        title="Properties for sale"
        description="Apartments, villas, houses and plots from verified owners and agents."
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Buy' }]}
      />
      <ListingBrowser listingType="sale" />
    </>
  );
}
