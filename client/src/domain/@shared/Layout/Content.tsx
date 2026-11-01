import { Outlet } from 'react-router';

import { Layout as AntdLayout } from 'antd';

import dayjs from 'dayjs';

export function Content() {
    const currentYear = dayjs().year();

    return (
        <AntdLayout style={{ padding: '0 clamp(8px, 2vw, 24px)' }}>
            <AntdLayout.Content style={{ padding: 'clamp(12px, 2vw, 24px)', margin: 0, minHeight: 200 }}>
                <Outlet />
            </AntdLayout.Content>

            <AntdLayout.Footer style={{ textAlign: 'center' }}>
                Contato Seguro Slim @{currentYear}
            </AntdLayout.Footer>
        </AntdLayout>
    );
}
