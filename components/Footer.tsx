'use client';

import { useApp } from './Providers';

export default function Footer({ name }: { name: string }) {
  const { t } = useApp();
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p>
          © {new Date().getFullYear()} {name}. {t('rights')}.
        </p>
      </div>
    </footer>
  );
}
