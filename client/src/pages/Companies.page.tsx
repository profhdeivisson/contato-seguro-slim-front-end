import { Fragment, useEffect, useMemo, useState } from 'react';

import {
    Button,
    Card,
    Col,
    Grid,
    Row,
    Space,
    type TableColumnsType,
    Typography,
} from 'antd';

import { Show } from '@domain/@shared/Show';
import { Table } from '@domain/@shared/Table';
import { CompaniesContextProvider, useCompaniesContext } from '@domain/company/Companies.context';
import type { Company } from '@domain/company/company.type';
import { CompaniesActionsCell } from '@domain/company/components/CompaniesActionsCell';
import { CreateCompanyModal } from '@domain/company/components/CreateCompanyModal';
import { EditCompanyModal } from '@domain/company/components/EditCompanyModal';

const COLUMNS: TableColumnsType<Company.Model> = [
    {
        title: 'ID',
        dataIndex: 'id',
        render: value => `#${value}`,
    },
    {
        title: 'Nome',
        dataIndex: 'name',
    },
    {
        title: 'CNPJ',
        dataIndex: 'cnpj',
    },
    {
        title: 'E-mail',
        dataIndex: 'email',
    },
    {
        title: 'Ações',
        fixed: 'right',
        width: 100,
        render: (_, record) => <CompaniesActionsCell company={record} />,
    },
];

function useIsMobile() {
    const screens = Grid.useBreakpoint();
    const [isMobile, setIsMobile] = useState(
        typeof window !== 'undefined' ? window.innerWidth < 768 : false
    );

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (screens.md !== undefined) {
        return !screens.md;
    }
    return isMobile;
}

function CompaniesContent() {
    const {
        isLoading,
        companies,
        setIsCreateModalVisible,
        isCreateModalVisible,
        isEditModalVisible,
    } = useCompaniesContext();

    const isMobile = useIsMobile();
    const [selectedRowKey, setSelectedRowKey] = useState<number | null>(null);

    const activeCompany = useMemo(() => {
        if (selectedRowKey === null) return null;
        for (let i = 0; i < companies.length; i++) {
            if (companies[i].id === selectedRowKey) return companies[i];
        }
        return null;
    }, [companies, selectedRowKey]);

    return (
        <Fragment>
            <main>
                <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                    <Typography.Title level={3} style={{ margin: 0 }}>
                        Empresas
                    </Typography.Title>

                    <Button
                        type="primary"
                        onClick={() => setIsCreateModalVisible(true)}
                    >
                        Cadastrar
                    </Button>
                </Row>

                {isMobile && activeCompany && (
                    <Card
                        size="small"
                        style={{
                            marginBottom: 16,
                            background: '#f0f5ff',
                            borderColor: '#adc6ff',
                            borderRadius: 8,
                        }}
                    >
                        <Row justify="space-between" align="middle" gutter={[8, 8]}>
                            <Col xs={24} sm={14}>
                                <Space>
                                    <Typography.Text strong style={{ color: '#1d39c4' }}>
                                        Empresa #{activeCompany.id} selecionada:
                                    </Typography.Text>
                                    <Typography.Text ellipsis style={{ maxWidth: 180 }}>
                                        {activeCompany.name}
                                    </Typography.Text>
                                </Space>
                            </Col>
                            <Col xs={24} sm={10} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                <Space size="middle">
                                    <CompaniesActionsCell company={activeCompany} />
                                    <Button
                                        size="small"
                                        type="text"
                                        onClick={() => setSelectedRowKey(null)}
                                        title="Desmarcar seleção"
                                    >
                                        ✕
                                    </Button>
                                </Space>
                            </Col>
                        </Row>
                    </Card>
                )}

                {isMobile && !activeCompany && (
                    <div style={{ marginBottom: 12 }}>
                        <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                            💡 Toque em uma linha para selecionar e exibir as ações disponíveis.
                        </Typography.Text>
                    </div>
                )}

                <Table
                    columns={COLUMNS}
                    dataSource={companies}
                    loading={isLoading}
                    rowSelection={isMobile ? {
                        type: 'radio',
                        selectedRowKeys: selectedRowKey !== null ? [selectedRowKey] : [],
                        onChange: keys => {
                            setSelectedRowKey(keys.length > 0 ? (keys[0] as number) : null);
                        },
                    } : undefined}
                    onRow={isMobile ? record => ({
                        onClick: () => {
                            setSelectedRowKey(prev => (prev === record.id ? null : record.id));
                        },
                        style: { cursor: 'pointer' },
                    }) : undefined}
                />
            </main>

            <Show when={isCreateModalVisible}>
                <CreateCompanyModal />
            </Show>

            <Show when={isEditModalVisible}>
                <EditCompanyModal />
            </Show>
        </Fragment>
    );
}

export function Companies() {
    return (
        <CompaniesContextProvider>
            {() => <CompaniesContent />}
        </CompaniesContextProvider>
    );
}
