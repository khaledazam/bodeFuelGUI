import { ConfigProvider, App } from 'antd';
import arEG from 'antd/lib/locale/ar_EG';
import { useSelector } from 'react-redux';
import { selectAppSettings } from '@/redux/settings/selectors';

export default function Localization({ children }) {
  const { idurar_app_language } = useSelector(selectAppSettings);

  // Force Arabic/RTL for professional conversion
  // but maintain flexibility if settings are changed in future
  const isArabic = true; // Hardcoded true for "Big Sweep" requirements
  
  const direction = 'rtl';
  const locale = arEG;

  return (
    <ConfigProvider
      direction={direction}
      locale={locale}
      theme={{
        token: {
          colorPrimary: '#339393',
          colorLink: '#1640D6',
          borderRadius: 4,
          fontFamily: 'Cairo, sans-serif',
        },
      }}
    >
      <App>
        <div style={{ direction: direction, minHeight: '100vh', fontFamily: 'Cairo, sans-serif' }}>
          {children}
        </div>
      </App>
    </ConfigProvider>
  );
}