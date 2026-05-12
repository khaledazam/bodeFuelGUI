import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, Dropdown, Layout, Badge, Button } from 'antd';

import { settingsAction } from '@/redux/settings/actions';
import { selectAppSettings } from '@/redux/settings/selectors';

// import Notifications from '@/components/Notification';

import { LogoutOutlined, ToolOutlined, UserOutlined } from '@ant-design/icons';

import { selectCurrentAdmin } from '@/redux/auth/selectors';

import { FILE_BASE_URL } from '@/config/serverApiConfig';

import useLanguage from '@/locale/useLanguage';

import UpgradeButton from './UpgradeButton';
import { MobileSidebar } from '@/apps/Navigation/NavigationContainer';
import useResponsive from '@/hooks/useResponsive';

export default function HeaderContent() {
  const currentAdmin = useSelector(selectCurrentAdmin);
  const { Header } = Layout;
  const { isMobile } = useResponsive();

  const translate = useLanguage();
  const dispatch = useDispatch();
  const { idurar_app_language: currentLang } = useSelector(selectAppSettings);

  const handleLanguageChange = (lang) => {
    dispatch(settingsAction.update({ entity: 'setting', settingKey: 'idurar_app_language', value: lang }));
    window.location.reload();
  };

  const ProfileDropdown = () => {
    const navigate = useNavigate();
    return (
      <div className="profileDropdown" onClick={() => navigate('/profile')}>
        <Avatar
          size="large"
          className="last"
          src={currentAdmin?.photo ? FILE_BASE_URL + currentAdmin?.photo : undefined}
          style={{
            color: '#f56a00',
            backgroundColor: currentAdmin?.photo ? 'none' : '#fde3cf',
            boxShadow: 'rgba(150, 190, 238, 0.35) 0px 0px 6px 1px',
          }}
        >
          {currentAdmin?.name?.charAt(0)?.toUpperCase()}
        </Avatar>
        <div className="profileDropdownInfo">
          <p>
            {currentAdmin?.name} {currentAdmin?.surname}
          </p>
          <p>{currentAdmin?.email}</p>
        </div>
      </div>
    );
  };

  const DropdownMenu = ({ text }) => {
    return <span style={{}}>{text}</span>;
  };

  const items = [
    {
      label: <ProfileDropdown className="headerDropDownMenu" />,
      key: 'ProfileDropdown',
    },
    {
      type: 'divider',
    },
    {
      icon: <UserOutlined />,
      key: 'settingProfile',
      label: (
        <Link to={'/profile'}>
          <DropdownMenu text={translate('profile_settings')} />
        </Link>
      ),
    },
    {
      icon: <ToolOutlined />,
      key: 'settingApp',
      label: <Link to={'/settings'}>{translate('app_settings')}</Link>,
    },

    {
      type: 'divider',
    },

    {
      icon: <LogoutOutlined />,
      key: 'logout',
      label: <Link to={'/logout'}>{translate('logout')}</Link>,
    },
  ];

  return (
    <Header
      style={{
        padding: isMobile ? '10px 15px' : '20px',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: ' 15px',
        boxShadow: isMobile ? '0 2px 8px #f0f1f2' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {isMobile && <MobileSidebar />}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <UpgradeButton />
        
        <Dropdown
          menu={{
            items,
          }}
          trigger={['click']}
          placement="bottomRight"
          stye={{ width: '280px', float: 'right' }}
        >
          <Avatar
            className="last"
            src={currentAdmin?.photo ? FILE_BASE_URL + currentAdmin?.photo : undefined}
            style={{
              color: '#f56a00',
              backgroundColor: currentAdmin?.photo ? 'none' : '#fde3cf',
              boxShadow: 'rgba(150, 190, 238, 0.35) 0px 0px 10px 2px',
              cursor: 'pointer',
            }}
            size="large"
          >
            {currentAdmin?.name?.charAt(0)?.toUpperCase()}
          </Avatar>
        </Dropdown>
      </div>

    </Header>
  );
}


