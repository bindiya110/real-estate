import LegalPage from './LegalPage';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const SECTIONS = [
  { heading: 'Information we collect', paragraphs: ['We collect the information you give us when you create an account, list a property, contact an agent or subscribe to our newsletter: your name, email address, phone number and any message content.', 'We also collect limited technical information such as browser type and pages visited, which helps us keep the service secure and improve it.'] },
  { heading: 'How we use your information', paragraphs: ['We use your information to operate EstateHub: to authenticate you, publish and moderate listings, deliver inquiries to the right agent or owner, and send service emails such as password resets.', 'We only send marketing emails if you subscribe, and every newsletter includes an unsubscribe link.'] },
  { heading: 'Sharing', paragraphs: ['When you send an inquiry, your name, email, phone and message are shared with the agent or owner of that listing. We do not sell your personal information.', 'We use trusted service providers (for example, image hosting and email delivery) who process data on our behalf under strict confidentiality obligations.'] },
  { heading: 'Security', paragraphs: ['Passwords are stored using strong one-way hashing. Sessions use secure, HTTP-only cookies and all traffic is encrypted in transit. No system is perfectly secure, but we work hard to protect your data.'] },
  { heading: 'Your choices', paragraphs: ['You can update your profile at any time from your dashboard, unsubscribe from emails, or contact us to request a copy or deletion of your data.'] },
  { heading: 'Contact', paragraphs: ['Questions about this policy? Reach us through the Contact page and our privacy team will respond.'] },
];

export default function PrivacyPolicyPage() {
  useDocumentTitle('Privacy policy');
  return (
    <LegalPage
      title="Privacy policy"
      updated="1 October 2026"
      intro="This policy explains what personal information EstateHub collects, how we use it, and the choices you have."
      sections={SECTIONS}
    />
  );
}
