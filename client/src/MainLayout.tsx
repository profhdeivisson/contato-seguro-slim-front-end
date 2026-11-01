import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useNavigation } from 'react-router';

import {
    Button,
    Drawer,
    type GetProp,
    Grid,
    Layout as AntdLayout,
    Menu as AntdMenu,
    type MenuProps,
    Spin,
    Typography,
} from 'antd';

import {
    AuditOutlined,
    BuildOutlined,
    CloseOutlined,
    HomeOutlined,
    MenuOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Layout } from '@domain/@shared/Layout';

type Item = NonNullable<MenuProps['items']>[number];

function useIsMobile() {
    const screens = Grid.useBreakpoint();
    const [isMobile, setIsMobile] = useState(
        typeof window !== 'undefined' ? window.innerWidth < 992 : false
    );

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 992);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (screens.lg !== undefined) {
        return !screens.lg;
    }
    return isMobile;
}

export function MainLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const navigation = useNavigation();
    const isMobile = useIsMobile();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const initialKey = location.pathname.split('/').slice(0, 2).join('/');

    if (navigation.state === 'loading')
        return <Spin fullscreen />;

    const handleNavigate = (path: string) => {
        navigate(path);
        setDrawerOpen(false);
    };

    const dashboardItem: Item = {
        key: '/',
        icon: <HomeOutlined />,
        label: 'Dashboard',
        onClick: () => handleNavigate('/'),
    };

    const companiesItem: Item = {
        key: '/companies',
        icon: <BuildOutlined />,
        label: 'Empresas',
        onClick: () => handleNavigate('/companies'),
    };

    const recordsItem: Item = {
        key: '/records',
        icon: <AuditOutlined />,
        label: 'Relatos',
        onClick: () => handleNavigate('/records'),
    };

    const peopleItem: Item = {
        key: '/people',
        icon: <UserOutlined />,
        label: 'Pessoas',
        onClick: () => handleNavigate('/people'),
    };

    const items = [dashboardItem, companiesItem, recordsItem, peopleItem];

    if (isMobile) {
        return (
            <AntdLayout style={{ minHeight: '100vh' }}>
                <AntdLayout.Header
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 16px',
                        background: '#001529',
                        height: 56,
                        lineHeight: '56px',
                        position: 'sticky',
                        top: 0,
                        zIndex: 100,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Button
                            type="text"
                            icon={
                                drawerOpen ? (
                                    <CloseOutlined style={{ color: '#fff', fontSize: 18 }} />
                                ) : (
                                    <MenuOutlined style={{ color: '#fff', fontSize: 18 }} />
                                )
                            }
                            onClick={() => setDrawerOpen(!drawerOpen)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 36,
                                height: 36,
                                padding: 0,
                            }}
                            aria-label={drawerOpen ? 'Fechar menu' : 'Abrir menu'}
                        />
                        <Typography.Text strong style={{ color: '#fff', fontSize: 16 }}>
                            Contato Seguro Slim
                        </Typography.Text>
                    </div>
                </AntdLayout.Header>

                <Drawer
                    placement="left"
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    width={240}
                    styles={{
                        body: { padding: 0, backgroundColor: '#001529' },
                        header: { backgroundColor: '#001529', borderBottom: '1px solid #1f1f1f' },
                    }}
                    title={<span style={{ color: '#fff', fontWeight: 600 }}>Navegação</span>}
                    closeIcon={<CloseOutlined style={{ color: '#fff' }} />}
                >
                    <AntdMenu
                        mode="inline"
                        theme="dark"
                        items={items}
                        selectedKeys={[initialKey]}
                        style={{ height: '100%', borderRight: 0 }}
                    />
                </Drawer>

                <Layout.Content />
            </AntdLayout>
        );
    }

    const sider: GetProp<typeof Layout.Root, 'sider'> = props => (
        <Layout.Sider {...props}
            items={items}
            defaultSelectedKeys={[initialKey]}
        />
    );

    return (
        <Layout.Root
            sider={sider}
            content={() => <Layout.Content />}
        />
    );
}
