import { Fragment, useEffect, useMemo, useState } from 'react';

import {
    Button,
    Card,
    Col,
    Divider,
    Empty,
    Grid,
    Input,
    Pagination,
    Row,
    Space,
    Spin,
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
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

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

    useEffect(() => {
        setCurrentPage(1);
    }, [searchText]);

    const paginatedPeople = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredPeople.slice(start, start + pageSize);
    }, [filteredPeople, currentPage]);

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

                {isMobile ? (
                    <Spin spinning={isLoading}>
                        {filteredPeople.length === 0 ? (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="Não há dados"
                            />
                        ) : (
                            <div>
                                {paginatedPeople.map(person => (
                                    <Card
                                        key={person.id}
                                        size="small"
                                        style={{
                                            marginBottom: 12,
                                            borderRadius: 8,
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                            <Typography.Text strong type="secondary">
                                                #{person.id}
                                            </Typography.Text>
                                            <Typography.Text strong style={{ fontSize: 15 }}>
                                                {person.name}
                                            </Typography.Text>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, margin: '8px 0', fontSize: 13 }}>
                                            <div>
                                                <Typography.Text type="secondary">CPF: </Typography.Text>
                                                <Typography.Text>{formatCpf(person.cpf)}</Typography.Text>
                                            </div>
                                            <div>
                                                <Typography.Text type="secondary">E-mail: </Typography.Text>
                                                <Typography.Text>{person.email}</Typography.Text>
                                            </div>
                                            <div>
                                                <Typography.Text type="secondary">Nascimento: </Typography.Text>
                                                <Typography.Text>{dayjs(person.birth_date).format('DD/MM/YYYY')}</Typography.Text>
                                            </div>
                                        </div>

                                        <Divider style={{ margin: '8px 0' }} />

                                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                            <PeopleActionsCell person={person} />
                                        </div>
                                    </Card>
                                ))}

                                {filteredPeople.length > pageSize && (
                                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                                        <Pagination
                                            current={currentPage}
                                            pageSize={pageSize}
                                            total={filteredPeople.length}
                                            onChange={page => setCurrentPage(page)}
                                            size="small"
                                            showSizeChanger={false}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </Spin>
                ) : (
                    <Table
                        columns={COLUMNS}
                        dataSource={filteredPeople}
                        loading={isLoading}
                    />
                )}
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
