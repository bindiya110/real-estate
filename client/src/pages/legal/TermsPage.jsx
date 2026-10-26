import LegalPage from './LegalPage';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const SECTIONS = [
  { heading: 'Using EstateHub', paragraphs: ['By creating an account or using EstateHub you agree to these terms. You must be at least 18 years old and provide accurate information.'] },
  { heading: 'Listings', paragraphs: ['You may only list properties you own or are authorised to market. Listings must be accurate, use genuine photos, and comply with applicable laws.', 'We review listings before publication and may reject, edit or remove any listing that breaks these terms or that we reasonably believe is misleading.'] },
  { heading: 'Accounts', paragraphs: ['You are responsible for keeping your password secure and for activity on your account. We may suspend accounts that abuse the service, post fraudulent listings or harass other users.'] },
  { heading: 'Inquiries and transactions', paragraphs: ['EstateHub connects buyers, tenants, owners and agents. We are not a party to any sale or rental agreement, and we do not guarantee the condition, title or value of any property. Always do your own due diligence.'] },
  { heading: 'Content', paragraphs: ['You keep ownership of content you upload, and grant us a licence to display it on EstateHub for the purpose of operating the service.'] },
  { heading: 'Liability', paragraphs: ['EstateHub is provided “as is”. To the extent permitted by law we are not liable for indirect or consequential losses arising from use of the service.'] },
  { heading: 'Changes', paragraphs: ['We may update these terms from time to time. If changes are material, we will notify registered users by email before they take effect.'] },
];

export default function TermsPage() {
  useDocumentTitle('Terms and conditions');
  return (
    <LegalPage
      title="Terms and conditions"
      updated="1 October 2026"
      intro="These terms govern your use of EstateHub. Please read them carefully."
      sections={SECTIONS}
    />
  );
}
