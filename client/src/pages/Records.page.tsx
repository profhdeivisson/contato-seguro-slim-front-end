import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';

import { Button, Col, Input, Row, Space, Spin, type TableColumnsType, Typography } from 'antd';

import { Show } from '@domain/@shared/Show';
import { Table } from '@domain/@shared/Table';
import { CompaniesContextProvider } from '@domain/company/Companies.context';
import { listInvolvements } from '@domain/involvement/api/list-involvements.service';
import { AnonymityTag } from '@domain/involvement/components/AnonymityTag';
import { RecordInvolvementsDrawer } from '@domain/involvement/components/RecordInvolvementsDrawer';
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

function RecordsContent() {
    const {
        isLoading,
        records,
        isCreateModalVisible,
        setIsCreateModalVisible,
        isEditModalVisible,
    } = useRecordsContext();

    const [selectedRecord, setSelectedRecord] = useState<Record.Model | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [anonymityMap, setAnonymityMap] = useState<Record<number, boolean>>({});
    const [searchText, setSearchText] = useState('');

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

    const handleOpenInvolvements = (record: Record.Model) => {
        setSelectedRecord(record);
        setIsDrawerOpen(true);
    };

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

    const columns: TableColumnsType<Record.Model> = useMemo(() => [
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
        {
            title: 'Ações',
            render: (_, record) => (
                <RecordsActionsCell
                    record={record}
                    onOpenInvolvements={handleOpenInvolvements}
                />
            ),
        },
    ], [anonymityMap]);

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

                <Table
                    columns={columns}
                    dataSource={filteredRecords}
                    loading={isLoading}
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
