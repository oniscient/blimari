"use client"

import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const router = useRouter();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    router.push(`/${lng}`);
  };

  return (
    <div>
      <button onClick={() => changeLanguage('en')} disabled={i18n.language === 'en'}>
        English
      </button>
      <button onClick={() => changeLanguage('pt')} disabled={i18n.language === 'pt'}>
        Português
      </button>
    </div>
  );
};

export default LanguageSwitcher;