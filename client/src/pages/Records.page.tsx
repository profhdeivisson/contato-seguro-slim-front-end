import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';

import {
    App,
    Button,
    Card,
    Col,
    Grid,
    Input,
    Popconfirm,
    Row,
    Space,
    Spin,
    type TableColumnsType,
    Tooltip,
    Typography,
} from 'antd';

import { DeleteOutlined, EditOutlined, TeamOutlined } from '@ant-design/icons';
import { handleServiceError, hasServiceError } from '@domain/@shared/service.helper';
import { Show } from '@domain/@shared/Show';
import { Table } from '@domain/@shared/Table';
import { CompaniesContextProvider } from '@domain/company/Companies.context';
import { listInvolvements } from '@domain/involvement/api/list-involvements.service';
import { AnonymityTag } from '@domain/involvement/components/AnonymityTag';
import { RecordInvolvementsDrawer } from '@domain/involvement/components/RecordInvolvementsDrawer';
import { deleteRecord } from '@domain/record/api/delete-record.service';
import { CreateRecordModal } from '@domain/record/components/CreateRecordModal';
import { EditRecordModal } from '@domain/record/components/EditRecordModal';
import { RecordsActionsCell } from '@domain/record/components/RecordsActionsCell';
import type { Record } from '@domain/record/record.type';
import { RecordsContextProvider, useRecordsContext } from '@domain/record/Records.context';

const STATUS_LABELS: Record<Record.Status, string> = {
    awaiting_investigation: 'Aguardando investigação',
    investigation_in_progress: 'Investigação em andamento',
    resolved: 'Resolvido',
    archived: 'Arquivado',
};

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

function RecordsContent() {
    const {
        isLoading,
        records,
        isCreateModalVisible,
        setIsCreateModalVisible,
        isEditModalVisible,
        setRecordId,
        fetchRecords,
    } = useRecordsContext();

    const isMobile = useIsMobile();
    const app = App.useApp();
    const [selectedRecord, setSelectedRecord] = useState<Record.Model | null>(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [anonymityMap, setAnonymityMap] = useState<Record<number, boolean>>({});
    const [searchText, setSearchText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const filteredRecords = useMemo(() => {
        if (!searchText.trim()) {
            return records;
        }
        const term = searchText.toLowerCase().trim();
        return records.filter(r => {
            const titleMatch = r.title ? r.title.toLowerCase().includes(term) : false;
            const descMatch = r.description ? r.description.toLowerCase().includes(term) : false;
            return titleMatch || descMatch;
        });
    }, [records, searchText]);

    const handleOpenInvolvements = useCallback((record: Record.Model) => {
        setSelectedRecord(record);
        setIsDrawerOpen(true);
    }, []);

    const handleInvolvementsUpdated = useCallback((recordId: number, isAnonymous: boolean) => {
        setAnonymityMap(prev => {
            const next = { ...prev };
            next[recordId] = isAnonymous;
            return next;
        });
    }, []);

    useEffect(() => {
        records.forEach(async record => {
            if (anonymityMap[record.id] === undefined) {
                const response = await listInvolvements(record.id);
                if (!('error' in response) && !(response instanceof Error)) {
                    handleInvolvementsUpdated(record.id, response.data.is_anonymous);
                }
            }
        });
    }, [records, anonymityMap, handleInvolvementsUpdated]);

    const columns: TableColumnsType<Record.Model> = useMemo(() => {
        const baseColumns: TableColumnsType<Record.Model> = [
            {
                title: 'ID',
                dataIndex: 'id',
                render: value => `#${value}`,
            },
            {
                title: 'Título',
                dataIndex: 'title',
            },
            {
                title: 'Status',
                dataIndex: 'status',
                render: value => (STATUS_LABELS[value as Record.Status] ? STATUS_LABELS[value as Record.Status] : value),
            },
            {
                title: 'Anonimato',
                dataIndex: 'id',
                render: (id, record) => {
                    const isAnonymous = anonymityMap[id as number];
                    if (isAnonymous === undefined) {
                        return <Spin size="small" />;
                    }
                    return (
                        <span
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleOpenInvolvements(record)}
                            title="Gerenciar pessoas envolvidas neste relato"
                        >
                            <AnonymityTag isAnonymous={isAnonymous} />
                        </span>
                    );
                },
            },
        ];

        if (!isMobile) {
            baseColumns.push({
                title: 'Ações',
                fixed: 'right',
                width: 120,
                render: (_, record) => (
                    <RecordsActionsCell
                        record={record}
                        onOpenInvolvements={handleOpenInvolvements}
                    />
                ),
            });
        }

        return baseColumns;
    }, [anonymityMap, isMobile, handleOpenInvolvements]);

    const handleEditSelected = () => {
        if (selectedRowKeys.length !== 1) return;
        setRecordId(selectedRowKeys[0]);
        setIsEditModalVisible(true);
    };

    const handleInvolvementsSelected = () => {
        if (selectedRowKeys.length !== 1) return;
        for (let i = 0; i < records.length; i++) {
            if (records[i].id === selectedRowKeys[0]) {
                handleOpenInvolvements(records[i]);
                break;
            }
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedRowKeys.length === 0) return;
        setIsDeleting(true);

        try {
            for (let i = 0; i < selectedRowKeys.length; i++) {
                const id = selectedRowKeys[i];
                const response = await deleteRecord(id);
                if (hasServiceError(response)) {
                    handleServiceError(app, response);
                    setIsDeleting(false);
                    return;
                }
            }

            app.message.success(
                selectedRowKeys.length === 1
                    ? 'Relato excluído com sucesso.'
                    : `${selectedRowKeys.length} relatos excluídos com sucesso.`
            );
            setSelectedRowKeys([]);
            await fetchRecords();
        } finally {
            setIsDeleting(false);
        }
    };

    const singleSelectedRecord = useMemo(() => {
        if (selectedRowKeys.length !== 1) return null;
        for (let i = 0; i < records.length; i++) {
            if (records[i].id === selectedRowKeys[0]) return records[i];
        }
        return null;
    }, [records, selectedRowKeys]);

    return (
        <Fragment>
            <main>
                <Row justify="space-between" align="middle" style={{ marginBottom: 16 }} gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                        <Space align="baseline">
                            <Typography.Title level={3} style={{ margin: 0 }}>
                                Relatos
                            </Typography.Title>
                            <Typography.Text type="secondary">
                                ({filteredRecords.length} {filteredRecords.length === 1 ? 'registro' : 'registros'})
                            </Typography.Text>
                        </Space>
                    </Col>

                    <Col xs={24} sm={12} style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
                        <Input.Search
                            placeholder="Buscar relatos por título ou descrição..."
                            allowClear
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            style={{ maxWidth: 320, width: '100%' }}
                        />
                        <Button
                            type="primary"
                            onClick={() => setIsCreateModalVisible(true)}
                        >
                            Cadastrar
                        </Button>
                    </Col>
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
                                {singleSelectedRecord ? (
                                    <Space>
                                        <Typography.Text strong style={{ color: '#1d39c4' }}>
                                            Relato #{singleSelectedRecord.id} selecionado:
                                        </Typography.Text>
                                        <Typography.Text ellipsis style={{ maxWidth: 160 }}>
                                            {singleSelectedRecord.title}
                                        </Typography.Text>
                                    </Space>
                                ) : (
                                    <Typography.Text strong style={{ color: '#1d39c4' }}>
                                        {selectedRowKeys.length} relatos selecionados
                                    </Typography.Text>
                                )}
                            </Col>

                            <Col xs={24} sm={12} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                <Space size="small">
                                    <Tooltip
                                        title={
                                            selectedRowKeys.length > 1
                                                ? 'Selecione apenas 1 relato para gerenciar envolvidos'
                                                : 'Pessoas Envolvidas'
                                        }
                                    >
                                        <Button
                                            type="text"
                                            icon={<TeamOutlined />}
                                            disabled={selectedRowKeys.length !== 1}
                                            onClick={handleInvolvementsSelected}
                                        />
                                    </Tooltip>

                                    <Tooltip
                                        title={
                                            selectedRowKeys.length > 1
                                                ? 'Selecione apenas 1 relato para editar'
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
                                                ? 'Excluir relato'
                                                : `Excluir ${selectedRowKeys.length} relatos`
                                        }
                                        description={
                                            selectedRowKeys.length === 1
                                                ? 'Tem certeza que deseja excluir o relato selecionado?'
                                                : `Tem certeza que deseja excluir os ${selectedRowKeys.length} relatos selecionados?`
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
                    dataSource={filteredRecords}
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
                <CreateRecordModal />
            </Show>

            <Show when={isEditModalVisible}>
                <EditRecordModal />
            </Show>

            <RecordInvolvementsDrawer
                record={selectedRecord}
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                onInvolvementsUpdated={handleInvolvementsUpdated}
            />
        </Fragment>
    );
}

export function Records() {
    return (
        <CompaniesContextProvider>
            {() => (
                <RecordsContextProvider>
                    {() => <RecordsContent />}
                </RecordsContextProvider>
            )}
        </CompaniesContextProvider>
    );
}
