import { MessageCircle } from 'lucide-react';
import { getGreetingWhatsAppUrl } from '../../utils/whatsapp';
import { useBusiness } from '../../contexts/BusinessContext';
import analyticsService from '../../services/analyticsService';
import './WhatsAppButton.css';

export default function WhatsAppButton() {
  const { business } = useBusiness();

  const handleClick = () => {
    analyticsService.trackWhatsAppClick();
  };

  return (
    <a
      href={getGreetingWhatsAppUrl(business?.whatsapp)}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-fab"
      aria-label="Chat on WhatsApp"
      onClick={handleClick}
    >
      <MessageCircle size={28} />
      <span className="whatsapp-fab__tooltip">Chat with us</span>
    </a>
  );
}
