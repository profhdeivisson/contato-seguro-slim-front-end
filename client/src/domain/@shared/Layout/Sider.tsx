import { Menu as AntdMenu, type MenuProps, theme } from 'antd';
import AntdSider from 'antd/es/layout/Sider';

import type { RenderSiderProps } from './Root';

type SiderProps = RenderSiderProps & Pick<MenuProps, 'items' | 'defaultSelectedKeys'>;

export function Sider({ collapsed, onCollapse, items, defaultSelectedKeys }: SiderProps) {
    const { token } = theme.useToken();

    return (
        <AntdSider
            width={200}
            collapsible
            collapsed={collapsed}
            onCollapse={onCollapse}
            style={{ background: token.colorBgContainer }}
        >
            <div style={{ height: 56, display: 'flex', alignItems: 'center', padding: '0 16px', background: '#002140', color: '#fff', fontWeight: 600, fontSize: 14 }}>
                Contato Seguro
            </div>
            <AntdMenu
                mode="inline"
                theme="dark"
                items={items}
                defaultSelectedKeys={defaultSelectedKeys}
                style={{ height: 'calc(100% - 56px)', borderRight: 0 }}
            />
        </AntdSider>
    );
}
