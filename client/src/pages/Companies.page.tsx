import { Fragment, useEffect, useMemo, useState } from 'react';

import {
    App,
    Button,
    Card,
    Col,
    Grid,
    Popconfirm,
    Row,
    Space,
    type TableColumnsType,
    Tooltip,
    Typography,
} from 'antd';

import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { handleServiceError, hasServiceError } from '@domain/@shared/service.helper';
import { Show } from '@domain/@shared/Show';
import { Table } from '@domain/@shared/Table';
import { deleteCompany } from '@domain/company/api/delete-company.service';
import { CompaniesContextProvider, useCompaniesContext } from '@domain/company/Companies.context';
import type { Company } from '@domain/company/company.type';
import { CompaniesActionsCell } from '@domain/company/components/CompaniesActionsCell';
import { CreateCompanyModal } from '@domain/company/components/CreateCompanyModal';
import { EditCompanyModal } from '@domain/company/components/EditCompanyModal';

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
        setCompanyId,
        fetchCompanies,
    } = useCompaniesContext();

    const isMobile = useIsMobile();
    const app = App.useApp();
    const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);

    const columns: TableColumnsType<Company.Model> = useMemo(() => {
        const baseColumns: TableColumnsType<Company.Model> = [
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
        ];

        if (!isMobile) {
            baseColumns.push({
                title: 'Ações',
                fixed: 'right',
                width: 100,
                render: (_, record) => <CompaniesActionsCell company={record} />,
            });
        }

        return baseColumns;
    }, [isMobile]);

    const singleSelectedCompany = useMemo(() => {
        if (selectedRowKeys.length !== 1) return null;
        for (let i = 0; i < companies.length; i++) {
            if (companies[i].id === selectedRowKeys[0]) return companies[i];
        }
        return null;
    }, [companies, selectedRowKeys]);

    const handleEditSelected = () => {
        if (selectedRowKeys.length !== 1) return;
        setCompanyId(selectedRowKeys[0]);
        setIsEditModalVisible(true);
    };

    const handleDeleteSelected = async () => {
        if (selectedRowKeys.length === 0) return;
        setIsDeleting(true);

        try {
            for (let i = 0; i < selectedRowKeys.length; i++) {
                const id = selectedRowKeys[i];
                const response = await deleteCompany(id);
                if (hasServiceError(response)) {
                    handleServiceError(app, response);
                    setIsDeleting(false);
                    return;
                }
            }

            app.message.success(
                selectedRowKeys.length === 1
                    ? 'Empresa excluída com sucesso.'
                    : `${selectedRowKeys.length} empresas excluídas com sucesso.`
            );
            setSelectedRowKeys([]);
            await fetchCompanies();
        } finally {
            setIsDeleting(false);
        }
    };

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

                {isMobile && selectedRowKeys.length > 0 && (
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
                            <Col xs={24} sm={12}>
                                {singleSelectedCompany ? (
                                    <Space>
                                        <Typography.Text strong style={{ color: '#1d39c4' }}>
                                            Empresa #{singleSelectedCompany.id} selecionada:
                                        </Typography.Text>
                                        <Typography.Text ellipsis style={{ maxWidth: 160 }}>
                                            {singleSelectedCompany.name}
                                        </Typography.Text>
                                    </Space>
                                ) : (
                                    <Typography.Text strong style={{ color: '#1d39c4' }}>
                                        {selectedRowKeys.length} empresas selecionadas
                                    </Typography.Text>
                                )}
                            </Col>

                            <Col xs={24} sm={12} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                <Space size="small">
                                    <Tooltip
                                        title={
                                            selectedRowKeys.length > 1
                                                ? 'Selecione apenas 1 empresa para editar'
                                                : 'Editar'
                                        }
                                    >
                                        <Button
                                            type="text"
                                            icon={<EditOutlined />}
                                            disabled={selectedRowKeys.length !== 1}
                                            onClick={handleEditSelected}
                                        />
                                    </Tooltip>

                                    <Popconfirm
                                        title={
                                            selectedRowKeys.length === 1
                                                ? 'Excluir empresa'
                                                : `Excluir ${selectedRowKeys.length} empresas`
                                        }
                                        description={
                                            selectedRowKeys.length === 1
                                                ? 'Tem certeza que deseja excluir a empresa selecionada?'
                                                : `Tem certeza que deseja excluir as ${selectedRowKeys.length} empresas selecionadas?`
                                        }
                                        placement="bottomRight"
                                        cancelText="Não"
                                        okText="Sim"
                                        okType="danger"
                                        okButtonProps={{ loading: isDeleting }}
                                        onConfirm={handleDeleteSelected}
                                    >
                                        <Tooltip title="Excluir">
                                            <Button
                                                type="text"
                                                icon={<DeleteOutlined />}
                                                danger
                                            />
                                        </Tooltip>
                                    </Popconfirm>

                                    <Button
                                        size="small"
                                        type="text"
                                        onClick={() => setSelectedRowKeys([])}
                                        title="Desmarcar seleção"
                                    >
                                        ✕
                                    </Button>
                                </Space>
                            </Col>
                        </Row>
                    </Card>
                )}

                {isMobile && selectedRowKeys.length === 0 && (
                    <div style={{ marginBottom: 12 }}>
                        <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                            💡 Selecione uma ou mais linhas da tabela para exibir as ações disponíveis.
                        </Typography.Text>
                    </div>
                )}

                <Table
                    columns={columns}
                    dataSource={companies}
                    loading={isLoading}
                    rowSelection={isMobile ? {
                        type: 'checkbox',
                        selectedRowKeys,
                        onChange: keys => setSelectedRowKeys(keys as number[]),
                    } : undefined}
                    onRow={isMobile ? record => ({
                        onClick: () => {
                            setSelectedRowKeys(prev => {
                                const exists = prev.indexOf(record.id) !== -1;
                                if (exists) {
                                    return prev.filter(id => id !== record.id);
                                }
                                return [...prev, record.id];
                            });
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
