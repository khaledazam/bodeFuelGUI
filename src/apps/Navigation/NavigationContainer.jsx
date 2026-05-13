import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Drawer, Layout, Menu } from 'antd';

import { useAppContext } from '@/context/appContext';
import logoIcon from '@/style/images/finallLogo.svg';
import logoText from '@/style/images/finallLogo.svg';
import useResponsive from '@/hooks/useResponsive';

import {
  SettingOutlined,
  CustomerServiceOutlined,
  ContainerOutlined,
  DashboardOutlined,
  TagOutlined,
  TagsOutlined,
  UserOutlined,
  ShopOutlined,
  BarChartOutlined,
  MenuOutlined,
  FileSyncOutlined,
} from '@ant-design/icons';

import { useSelector } from 'react-redux';
import { selectCurrentAdmin } from '@/redux/auth/selectors';

const { Sider } = Layout;

export default function Navigation() {
  const { isMobile } = useResponsive();
  return isMobile ? null : <Sidebar collapsible={false} />;
}

function Sidebar({ collapsible, isMobile = false }) {
  let location = useLocation();

  const { state: stateApp, appContextAction } = useAppContext();
  const { isNavMenuClose } = stateApp;
  const { navMenu } = appContextAction;
  const [showLogoApp, setLogoApp] = useState(isNavMenuClose);
  const [currentPath, setCurrentPath] = useState(location.pathname.slice(1));

  const navigate = useNavigate();
  const currentAdmin = useSelector(selectCurrentAdmin);

  let items = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to={'/'}>لوحة التحكم</Link>,
    },
    {
      key: 'order',
      icon: <ContainerOutlined />,
      label: <Link to={'/order'}>الطلبات والمبيعات</Link>,
    },
    {
      key: 'product',
      icon: <ShopOutlined />,
      label: <Link to={'/product'}>المكملات الغذائية</Link>,
    },
    {
      key: 'inventory',
      icon: <TagsOutlined />,
      label: <Link to={'/inventory'}>المخزون والجرد</Link>,
    },
    {
      key: 'inventorylog',
      icon: <FileSyncOutlined />,
      label: <Link to={'/inventorylog'}>سجل حركات المخزن</Link>,
    },
    {
      key: 'customer',
      icon: <CustomerServiceOutlined />,
      label: <Link to={'/customer'}>العملاء</Link>,
    },
    {
      key: 'expense',
      icon: <ShopOutlined />, // Using Shop as an icon for now or FallOutlined. I'll use ShopOutlined as it is imported.
      label: <Link to={'/expense'}>المصروفات والمسحوبات</Link>,
    },
    {
      key: 'supplier',
      icon: <UserOutlined />,
      label: <Link to={'/supplier'}>الموردين</Link>,
    },
    {
      key: 'category',
      icon: <TagOutlined />,
      label: <Link to={'/category'}>التصنيفات</Link>,
    },
    {
      key: 'brand',
      icon: <TagOutlined />,
      label: <Link to={'/brand'}>الماركات</Link>,
    },
    {
      key: 'reports',
      icon: <BarChartOutlined />,
      label: <Link to={'/reports'}>التقارير</Link>,
    },
    {
      key: 'generalSettings',
      label: <Link to={'/settings'}>الإعدادات</Link>,
      icon: <SettingOutlined />,
    },
  ];

  if (currentAdmin?.role === 'cashier') {
    items = items.filter(
      (item) => !['generalSettings', 'reports', 'supplier', 'inventory', 'inventorylog'].includes(item.key)
    );
  }

  useEffect(() => {
    if (location)
      if (currentPath !== location.pathname) {
        if (location.pathname === '/') {
          setCurrentPath('dashboard');
        } else setCurrentPath(location.pathname.slice(1));
      }
  }, [location, currentPath]);

  useEffect(() => {
    if (isNavMenuClose) {
      setLogoApp(isNavMenuClose);
    }
    const timer = setTimeout(() => {
      if (!isNavMenuClose) {
        setLogoApp(isNavMenuClose);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [isNavMenuClose]);

  const onCollapse = () => {
    navMenu.collapse();
  };

  return (
    <Sider
      collapsible={collapsible}
      collapsed={collapsible ? isNavMenuClose : collapsible}
      onCollapse={onCollapse}
      className="navigation"
      width={256}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'relative',
        bottom: '20px',
        ...(!isMobile && {
          ['left']: '20px',
          top: '20px',
        }),
      }}
      theme={'light'}
    >
      <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <img src={logoIcon} alt="Logo" style={{ marginLeft: '-20px', height: '100px', width: '100px', borderRadius: '50%', border: '2px solid #d9d9d9', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', marginBottom: '100px' }} />
        {!showLogoApp && (
          <img
             src={logoText}
             alt="Logo"
             style={{ marginTop: '3px', marginLeft: '10px', height: '0px' }}
          />
        )}
      </div>
      <Menu
        items={items}
        mode="inline"
        theme={'light'}
        selectedKeys={[currentPath]}
        style={{ width: 256 }}
      />
    </Sider>
  );
}

export function MobileSidebar() {
  const [visible, setVisible] = useState(false);
  const showDrawer = () => setVisible(true);
  const onClose = () => setVisible(false);

  return (
    <>
      <Button
        type="text"
        size="large"
        onClick={showDrawer}
        className="mobile-sidebar-btn"
        style={{ marginLeft: 25 }}
      >
        <MenuOutlined style={{ fontSize: 18 }} />
      </Button>
      <Drawer
        width={250}
        placement={'right'}
        closable={false}
        onClose={onClose}
        open={visible}
        bodyStyle={{ padding: 0 }}
      >
        <Sidebar collapsible={false} isMobile={true} />
      </Drawer>
    </>
  );
}
