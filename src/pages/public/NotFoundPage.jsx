import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home } from 'lucide-react';
import Button from '../../components/common/Button';
import './NotFoundPage.css';

export default function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <main className="not-found-page">
      <div className="container not-found-content">
        <h1 className="not-found-code">404</h1>
        <h2>{t('notFound.title')}</h2>
        <p>{t('notFound.message')}</p>
        <Button variant="primary" icon={Home} href="/">{t('notFound.goHome')}</Button>
      </div>
    </main>
  );
}
