import { Fragment, useMemo, useState } from 'react';

import { Button, Col, Input, Row, Space, type TableColumnsType, Typography } from 'antd';

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
        render: (_, record) => <PeopleActionsCell person={record} />,
    },
];

function PeopleContent() {
    const {
        isLoading,
        people,
        setIsCreateModalVisible,
        isCreateModalVisible,
        isEditModalVisible,
    } = usePeopleContext();

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

                <Table
                    columns={COLUMNS}
                    dataSource={filteredPeople}
                    loading={isLoading}
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
