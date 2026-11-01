import { Fragment, useEffect, useMemo, useState } from 'react';

import {
    Button,
    Card,
    Col,
    Grid,
    Input,
    Row,
    Space,
    type TableColumnsType,
    Typography,
} from 'antd';

import { Show } from '@domain/@shared/Show';
import { Table } from '@domain/@shared/Table';
import { CreatePersonModal } from '@domain/person/components/CreatePersonModal';
import { EditPersonModal } from '@domain/person/components/EditPersonModal';
import { PeopleActionsCell } from '@domain/person/components/PeopleActionsCell';
import { formatCpf } from '@domain/person/helper/cpf.helper';
import { PeopleContextProvider, usePeopleContext } from '@domain/person/People.context';
import type { Person } from '@domain/person/person.type';
import dayjs from 'dayjs';

const COLUMNS: TableColumnsType<Person.Model> = [
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
    {
        title: 'Ações',
        fixed: 'right',
        width: 100,
        render: (_, record) => <PeopleActionsCell person={record} />,
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

function PeopleContent() {
    const {
        isLoading,
        people,
        setIsCreateModalVisible,
        isCreateModalVisible,
        isEditModalVisible,
    } = usePeopleContext();

    const isMobile = useIsMobile();
    const [selectedRowKey, setSelectedRowKey] = useState<number | null>(null);
    const [searchText, setSearchText] = useState('');

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

    const activePerson = useMemo(() => {
        if (selectedRowKey === null) return null;
        for (let i = 0; i < people.length; i++) {
            if (people[i].id === selectedRowKey) return people[i];
        }
        return null;
    }, [people, selectedRowKey]);

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

                {isMobile && activePerson && (
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
                                        Pessoa #{activePerson.id} selecionada:
                                    </Typography.Text>
                                    <Typography.Text ellipsis style={{ maxWidth: 180 }}>
                                        {activePerson.name}
                                    </Typography.Text>
                                </Space>
                            </Col>
                            <Col xs={24} sm={10} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                <Space size="middle">
                                    <PeopleActionsCell person={activePerson} />
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

                {isMobile && !activePerson && (
                    <div style={{ marginBottom: 12 }}>
                        <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                            💡 Toque em uma linha para selecionar e exibir as ações disponíveis.
                        </Typography.Text>
                    </div>
                )}

                <Table
                    columns={COLUMNS}
                    dataSource={filteredPeople}
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
