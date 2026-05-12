import { Space, Layout, Divider, Typography } from 'antd';
import logo from '@/style/images/finallLogo.svg';
import useLanguage from '@/locale/useLanguage';
import { useSelector } from 'react-redux';

const { Content } = Layout;
const { Title, Text } = Typography;

export default function SideContent() {
  const translate = useLanguage();

  return (
    <Content
      style={{
        padding: '150px 30px 30px',
        width: '100%',
        maxWidth: '450px',
        margin: '0 auto',
      }}
      className="sideContent"
    >
      <div style={{ width: '100%', textAlign: 'center', justifyContent: 'center', alignItems: 'center',height: '100%',display: 'flex',flexDirection: 'column' }}>
        <img
          src={logo}
          alt="IDURAR ERP CRM"
          style={{ margin: '0 0 40px', display: 'block',justifyContent: 'center', alignItems: 'center',height: '100%',width: '100%' }}
          height={63}
          width={220}
        />
        <div className="space20"></div>
      </div>
    </Content>
  );
}
