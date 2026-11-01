import { Fragment, useEffect, useMemo, useState } from 'react';

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
    type TableColumnsType,
    Tooltip,
    Typography,
} from 'antd';

import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { handleServiceError, hasServiceError } from '@domain/@shared/service.helper';
import { Show } from '@domain/@shared/Show';
import { Table } from '@domain/@shared/Table';
import { deletePerson } from '@domain/person/api/delete-person.service';
import { CreatePersonModal } from '@domain/person/components/CreatePersonModal';
import { EditPersonModal } from '@domain/person/components/EditPersonModal';
import { PeopleActionsCell } from '@domain/person/components/PeopleActionsCell';
import { formatCpf } from '@domain/person/helper/cpf.helper';
import { PeopleContextProvider, usePeopleContext } from '@domain/person/People.context';
import type { Person } from '@domain/person/person.type';
import dayjs from 'dayjs';

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

function PeopleContent() {
    const {
        isLoading,
        people,
        setIsCreateModalVisible,
        isCreateModalVisible,
        isEditModalVisible,
        setPersonId,
        fetchPeople,
    } = usePeopleContext();

    const isMobile = useIsMobile();
    const app = App.useApp();
    const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
    const [searchText, setSearchText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const filteredPeople = useMemo(() => {
        if (!searchText.trim()) {
            return people;
        }
        const term = searchText.toLowerCase().trim();
        return people.filter(p => {
            const nameMatch = p.name ? p.name.toLowerCase().includes(term) : false;
            const cleanCpf = p.cpf ? p.cpf.replace(/\D/g, '') : '';
            const searchDigits = term.replace(/\D/g, '');
            const cpfMatch = (searchDigits.length > 0 && cleanCpf.includes(searchDigits)) || (p.cpf ? p.cpf.toLowerCase().includes(term) : false);
            const emailMatch = p.email ? p.email.toLowerCase().includes(term) : false;
            return nameMatch || cpfMatch || emailMatch;
        });
    }, [people, searchText]);

    const columns: TableColumnsType<Person.Model> = useMemo(() => {
        const baseColumns: TableColumnsType<Person.Model> = [
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
                title: 'CPF',
                dataIndex: 'cpf',
                render: value => formatCpf(value),
            },
            {
                title: 'E-mail',
                dataIndex: 'email',
            },
            {
                title: 'Data de Nascimento',
                dataIndex: 'birth_date',
                render: value => dayjs(value).format('DD/MM/YYYY'),
            },
        ];

        if (!isMobile) {
            baseColumns.push({
                title: 'Ações',
                fixed: 'right',
                width: 100,
                render: (_, record) => <PeopleActionsCell person={record} />,
            });
        }

        return baseColumns;
    }, [isMobile]);

    const singleSelectedPerson = useMemo(() => {
        if (selectedRowKeys.length !== 1) return null;
        for (let i = 0; i < people.length; i++) {
            if (people[i].id === selectedRowKeys[0]) return people[i];
        }
        return null;
    }, [people, selectedRowKeys]);

    const handleEditSelected = () => {
        if (selectedRowKeys.length !== 1) return;
        setPersonId(selectedRowKeys[0]);
        setIsEditModalVisible(true);
    };

    const handleDeleteSelected = async () => {
        if (selectedRowKeys.length === 0) return;
        setIsDeleting(true);

        try {
            for (let i = 0; i < selectedRowKeys.length; i++) {
                const id = selectedRowKeys[i];
                const response = await deletePerson(id);
                if (hasServiceError(response)) {
                    handleServiceError(app, response);
                    setIsDeleting(false);
                    return;
                }
            }

            app.message.success(
                selectedRowKeys.length === 1
                    ? 'Pessoa excluída com sucesso.'
                    : `${selectedRowKeys.length} pessoas excluídas com sucesso.`
            );
            setSelectedRowKeys([]);
            await fetchPeople();
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Fragment>
            <main>
                <Row justify="space-between" align="middle" style={{ marginBottom: 16 }} gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                        <Space align="baseline">
                            <Typography.Title level={3} style={{ margin: 0 }}>
                                Pessoas
                            </Typography.Title>
                            <Typography.Text type="secondary">
                                ({filteredPeople.length} {filteredPeople.length === 1 ? 'registro' : 'registros'})
                            </Typography.Text>
                        </Space>
                    </Col>

                    <Col xs={24} sm={12} style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
                        <Input.Search
                            placeholder="Buscar por nome, CPF ou e-mail..."
                            allowClear
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            style={{ maxWidth: 300, width: '100%' }}
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
                                {singleSelectedPerson ? (
                                    <Space>
                                        <Typography.Text strong style={{ color: '#1d39c4' }}>
                                            Pessoa #{singleSelectedPerson.id} selecionada:
                                        </Typography.Text>
                                        <Typography.Text ellipsis style={{ maxWidth: 160 }}>
                                            {singleSelectedPerson.name}
                                        </Typography.Text>
                                    </Space>
                                ) : (
                                    <Typography.Text strong style={{ color: '#1d39c4' }}>
                                        {selectedRowKeys.length} pessoas selecionadas
                                    </Typography.Text>
                                )}
                            </Col>

                            <Col xs={24} sm={12} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                <Space size="small">
                                    <Tooltip
                                        title={
                                            selectedRowKeys.length > 1
                                                ? 'Selecione apenas 1 pessoa para editar'
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
                                                ? 'Excluir pessoa'
                                                : `Excluir ${selectedRowKeys.length} pessoas`
                                        }
                                        description={
                                            selectedRowKeys.length === 1
                                                ? 'Tem certeza que deseja excluir a pessoa selecionada?'
                                                : `Tem certeza que deseja excluir as ${selectedRowKeys.length} pessoas selecionadas?`
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
                    dataSource={filteredPeople}
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
                <CreatePersonModal />
            </Show>

            <Show when={isEditModalVisible}>
                <EditPersonModal />
            </Show>
        </Fragment>
    );
}

export function People() {
    return (
        <PeopleContextProvider>
            {() => <PeopleContent />}
        </PeopleContextProvider>
    );
}
