import React from 'react';
import { useTranslation } from 'react-i18next';
import { Panel } from './UiElements';

interface SettingsMenuProps {
  onClose: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ onClose }) => {
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = React.useState(i18n.language);

  const [soundEnabled, setSoundEnabled] = React.useState(() => (localStorage.getItem('soundEnabled') ?? 'true') === 'true');
  const [volume, setVolume] = React.useState<number>(() => parseFloat(localStorage.getItem('soundVolume') ?? '0.8'));
  const toggleSound = (v: boolean) => { setSoundEnabled(v); localStorage.setItem('soundEnabled', String(v)); };
  const onVolume = (v: number) => { setVolume(v); localStorage.setItem('soundVolume', String(v)); };

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
      <Panel className="flex flex-col items-center space-y-6 min-w-[400px]">
        <h2 className="text-4xl text-shadow text-white">{t('settings.title')}</h2>
        
        <div className="w-full">
          <p className="text-2xl mb-3 text-white text-shadow">{t('settings.language')}</p>
          <div className="flex space-x-4 justify-center">
            <button
              onClick={() => handleLanguageChange('en')}
              className={`text-2xl px-6 py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors ${
                selectedLanguage === 'en'
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-black hover:bg-gray-200'
              }`}
            >
              {t('settings.english')}
            </button>
            <button
              onClick={() => handleLanguageChange('es')}
              className={`text-2xl px-6 py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors ${
                selectedLanguage === 'es'
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-black hover:bg-gray-200'
              }`}
            >
              {t('settings.spanish')}
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-3xl bg-[#e0a849] text-black px-8 py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#f0b95a] transition-colors"
        >
          {t('settings.close')}
        </button>
      </Panel>
    </div>
  );
};

export default SettingsMenu;
