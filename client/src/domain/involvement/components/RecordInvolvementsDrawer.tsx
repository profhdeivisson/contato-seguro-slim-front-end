import { useCallback, useEffect, useState } from 'react';

import {
    App,
    Button,
    Card,
    Col,
    Drawer,
    Empty,
    Form,
    Popconfirm,
    Row,
    Select,
    Space,
    Table,
    type TableColumnsType,
    Typography,
} from 'antd';

import { DeleteOutlined, UserAddOutlined } from '@ant-design/icons';
import { handleServiceError, hasServiceError } from '@domain/@shared/service.helper';
import type { Service } from '@domain/@shared/service.type';
import { listPeople } from '@domain/person/api/list-people.service';
import { formatCpf } from '@domain/person/helper/cpf.helper';
import type { Person } from '@domain/person/person.type';
import type { Record as RecordDomain } from '@domain/record/record.type';

import { createInvolvement } from '../api/create-involvement.service';
import { deleteInvolvement } from '../api/delete-involvement.service';
import { listInvolvements } from '../api/list-involvements.service';
import {
    type Involvement,
    INVOLVEMENT_TYPE_LABELS,
} from '../involvement.type';
import { AnonymityTag } from './AnonymityTag';
import { InvolvementTypeTag } from './InvolvementTypeTag';

type Props = {
    record: RecordDomain.Model | null;
    open: boolean;
    onClose: () => void;
    onInvolvementsUpdated?: (recordId: number, isAnonymous: boolean) => void;
};

type FormValues = {
    person_id: number;
    type: Involvement.Type;
};

const TYPE_OPTIONS: { label: string; value: Involvement.Type }[] = [
    { label: INVOLVEMENT_TYPE_LABELS.whistleblower, value: 'whistleblower' },
    { label: INVOLVEMENT_TYPE_LABELS.witness, value: 'witness' },
    { label: INVOLVEMENT_TYPE_LABELS.victim, value: 'victim' },
    { label: INVOLVEMENT_TYPE_LABELS.denounced, value: 'denounced' },
];

export function RecordInvolvementsDrawer({
    record,
    open,
    onClose,
    onInvolvementsUpdated,
}: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [involvements, setInvolvements] = useState<Involvement.Model[]>([]);
    const [isAnonymous, setIsAnonymous] = useState(true);
    const [availablePeople, setAvailablePeople] = useState<Person.Model[]>([]);

    const [form] = Form.useForm<FormValues>();
    const app = App.useApp();

    const fetchInvolvements = useCallback(async () => {
        if (!record) return;

        setIsLoading(true);

        const response = await listInvolvements(record.id);

        setIsLoading(false);

        if (hasServiceError(response)) {
            return handleServiceError(app, response);
        }

        setInvolvements(response.data.involvements);
        setIsAnonymous(response.data.is_anonymous);

        if (onInvolvementsUpdated) {
            onInvolvementsUpdated(record.id, response.data.is_anonymous);
        }
    }, [record, app, onInvolvementsUpdated]);

    const fetchPeopleList = useCallback(async () => {
        const response = await listPeople();

        if (hasServiceError(response)) {
            return;
        }

        setAvailablePeople(response.data.people);
    }, []);

    useEffect(() => {
        if (open && record) {
            fetchInvolvements();
            fetchPeopleList();
        }
    }, [open, record, fetchInvolvements, fetchPeopleList]);

    const makeConflictErrorMessage = (exception: Service.ServerException) => {
        if (exception.statusCode === 409) {
            return 'Esta pessoa já está vinculada a este relato.';
        }
        return null;
    };

    const handleAddInvolvement = async (values: FormValues) => {
        if (!record) return;

        setIsSubmitting(true);

        const response = await createInvolvement(record.id, {
            person_id: values.person_id,
            type: values.type,
        });

        setIsSubmitting(false);

        if (hasServiceError(response)) {
            return handleServiceError(app, response, makeConflictErrorMessage);
        }

        app.notification.success({
            message: 'Sucesso!',
            description: 'Pessoa vinculada ao relato com sucesso.',
        });

        form.resetFields();
        fetchInvolvements();
    };

    const handleDeleteInvolvement = async (involvementId: number) => {
        if (!record) return;

        setIsLoading(true);

        const response = await deleteInvolvement(record.id, involvementId);

        setIsLoading(false);

        if (hasServiceError(response)) {
            return handleServiceError(app, response);
        }

        app.notification.success({
            message: 'Sucesso!',
            description: 'Envolvimento removido com sucesso.',
        });

        fetchInvolvements();
    };

    const columns: TableColumnsType<Involvement.Model> = [
        {
            title: 'Papel',
            dataIndex: 'type',
            width: 140,
            render: (type: Involvement.Type) => <InvolvementTypeTag type={type} />,
        },
        {
            title: 'Nome',
            dataIndex: ['person', 'name'],
            render: (_, item) => (item.person && item.person.name ? item.person.name : `#${item.person_id}`),
        },
        {
            title: 'CPF',
            dataIndex: ['person', 'cpf'],
            render: (_, item) => (item.person && item.person.cpf ? formatCpf(item.person.cpf) : '-'),
        },
        {
            title: 'E-mail',
            dataIndex: ['person', 'email'],
            render: (_, item) => (item.person && item.person.email ? item.person.email : '-'),
        },
        {
            title: 'Ações',
            width: 80,
            render: (_, item) => (
                <Popconfirm
                    title="Desvincular pessoa"
                    description="Tem certeza que deseja desvincular esta pessoa do relato?"
                    okText="Sim"
                    cancelText="Não"
                    okType="danger"
                    onConfirm={() => handleDeleteInvolvement(item.id)}
                >
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        title="Desvincular"
                    />
                </Popconfirm>
            ),
        },
    ];

    return (
        <Drawer
            open={open}
            onClose={onClose}
            title="Gestão de Envolvidos"
            width={720}
        >
            {record && (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <Card size="small">
                        <Row justify="space-between" align="middle">
                            <Col span={18}>
                                <Typography.Text type="secondary">Relato #{record.id}</Typography.Text>
                                <Typography.Title level={5} style={{ margin: 0 }}>
                                    {record.title}
                                </Typography.Title>
                            </Col>
                            <Col span={6} style={{ textAlign: 'right' }}>
                                <AnonymityTag isAnonymous={isAnonymous} />
                            </Col>
                        </Row>
                    </Card>

                    <Card size="small" title="Vincular Pessoa ao Relato">
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleAddInvolvement}
                        >
                            <Row gutter={16}>
                                <Col span={14}>
                                    <Form.Item<FormValues>
                                        name="person_id"
                                        label="Pessoa"
                                        rules={[{ required: true, message: 'Selecione uma pessoa.' }]}
                                    >
                                        <Select
                                            placeholder="Buscar por nome ou CPF..."
                                            showSearch
                                            filterOption={(input, option) => {
                                                const label = option && option.label ? String(option.label) : '';
                                                return label.toLowerCase().includes(input.toLowerCase());
                                            }}
                                            options={availablePeople.map(p => ({
                                                label: `${p.name} (${formatCpf(p.cpf)})`,
                                                value: p.id,
                                            }))}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={10}>
                                    <Form.Item<FormValues>
                                        name="type"
                                        label="Tipo de Envolvimento"
                                        rules={[{ required: true, message: 'Selecione o tipo.' }]}
                                    >
                                        <Select
                                            placeholder="Selecione o papel..."
                                            options={TYPE_OPTIONS}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row justify="end">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    icon={<UserAddOutlined />}
                                    loading={isSubmitting}
                                >
                                    Vincular
                                </Button>
                            </Row>
                        </Form>
                    </Card>

                    <div>
                        <Typography.Title level={5}>
                            Pessoas Envolvidas ({involvements.length})
                        </Typography.Title>

                        <Table
                            rowKey="id"
                            columns={columns}
                            dataSource={involvements}
                            loading={isLoading}
                            pagination={false}
                            locale={{
                                emptyText: (
                                    <Empty
                                        description="Nenhuma pessoa vinculada a este relato ainda."
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    />
                                ),
                            }}
                        />
                    </div>
                </Space>
            )}
        </Drawer>
    );
}
