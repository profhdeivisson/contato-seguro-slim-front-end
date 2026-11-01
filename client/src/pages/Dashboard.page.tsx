import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import {
    Alert,
    Button,
    Card,
    Col,
    Divider,
    Progress,
    Row,
    Space,
    Spin,
    Statistic,
    Tag,
    Typography,
} from 'antd';

import {
    AuditOutlined,
    BuildOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    FileSearchOutlined,
    InboxOutlined,
    RightOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { listCompanies } from '@domain/company/api/list-companies.service';
import { listPeople } from '@domain/person/api/list-people.service';
import { listRecords } from '@domain/record/api/list-records.service';

export function Dashboard() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [recordsCount, setRecordsCount] = useState(0);
    const [peopleCount, setPeopleCount] = useState(0);
    const [companiesCount, setCompaniesCount] = useState(0);
    const [statusStats, setStatusStats] = useState({
        awaiting: 0,
        inProgress: 0,
        resolved: 0,
        archived: 0,
    });

    useEffect(() => {
        let isMounted = true;

        async function loadDashboardData() {
            setIsLoading(true);
            try {
                const [recordsRes, peopleRes, companiesRes] = await Promise.all([
                    listRecords(),
                    listPeople(),
                    listCompanies(),
                ]);

                if (!isMounted) return;

                if (!('error' in recordsRes) && !(recordsRes instanceof Error)) {
                    const records = recordsRes.data.records;
                    setRecordsCount(records.length);

                    let awaiting = 0;
                    let inProgress = 0;
                    let resolved = 0;
                    let archived = 0;

                    records.forEach(r => {
                        if (r.status === 'awaiting_investigation') awaiting += 1;
                        else if (r.status === 'investigation_in_progress') inProgress += 1;
                        else if (r.status === 'resolved') resolved += 1;
                        else if (r.status === 'archived') archived += 1;
                    });

                    setStatusStats({ awaiting, inProgress, resolved, archived });
                }

                if (!('error' in peopleRes) && !(peopleRes instanceof Error)) {
                    setPeopleCount(peopleRes.data.people.length);
                }

                if (!('error' in companiesRes) && !(companiesRes instanceof Error)) {
                    setCompaniesCount(companiesRes.data.companies.length);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadDashboardData();

        return () => {
            isMounted = false;
        };
    }, []);

    const resolvedRate = recordsCount > 0 ? Math.round((statusStats.resolved / recordsCount) * 100) : 0;

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
                <Typography.Title level={3} style={{ marginBottom: 4 }}>
                    Visão Geral do Canal de Ética e Compliance
                </Typography.Title>
                <Typography.Text type="secondary">
                    Monitore relatos, pessoas envolvidas e empresas atendidas pela plataforma.
                </Typography.Text>
            </div>

            <Spin spinning={isLoading}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            hoverable
                            onClick={() => navigate('/records')}
                            style={{ cursor: 'pointer' }}
                        >
                            <Statistic
                                title="Relatos Registrados"
                                value={recordsCount}
                                prefix={<AuditOutlined style={{ color: '#1677ff', marginRight: 8 }} />}
                            />
                            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography.Text type="secondary">Ver relatos</Typography.Text>
                                <RightOutlined style={{ fontSize: 12, color: '#8c8c8c' }} />
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            hoverable
                            onClick={() => navigate('/people')}
                            style={{ cursor: 'pointer' }}
                        >
                            <Statistic
                                title="Pessoas Cadastradas"
                                value={peopleCount}
                                prefix={<UserOutlined style={{ color: '#52c41a', marginRight: 8 }} />}
                            />
                            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography.Text type="secondary">Ver pessoas</Typography.Text>
                                <RightOutlined style={{ fontSize: 12, color: '#8c8c8c' }} />
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            hoverable
                            onClick={() => navigate('/companies')}
                            style={{ cursor: 'pointer' }}
                        >
                            <Statistic
                                title="Empresas Monitoradas"
                                value={companiesCount}
                                prefix={<BuildOutlined style={{ color: '#722ed1', marginRight: 8 }} />}
                            />
                            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography.Text type="secondary">Ver empresas</Typography.Text>
                                <RightOutlined style={{ fontSize: 12, color: '#8c8c8c' }} />
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Taxa de Resolução"
                                value={resolvedRate}
                                suffix="%"
                                prefix={<CheckCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />}
                            />
                            <div style={{ marginTop: 12 }}>
                                <Progress
                                    percent={resolvedRate}
                                    showInfo={false}
                                    strokeColor="#52c41a"
                                    size="small"
                                />
                            </div>
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                    <Col xs={24} md={14}>
                        <Card title="Distribuição de Relatos por Status" style={{ height: '100%' }}>
                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Space>
                                        <ClockCircleOutlined style={{ color: '#fa8c16' }} />
                                        <Typography.Text>Aguardando investigação</Typography.Text>
                                    </Space>
                                    <Tag color="orange">{statusStats.awaiting}</Tag>
                                </div>
                                <Divider style={{ margin: '8px 0' }} />

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Space>
                                        <FileSearchOutlined style={{ color: '#1677ff' }} />
                                        <Typography.Text>Investigação em andamento</Typography.Text>
                                    </Space>
                                    <Tag color="blue">{statusStats.inProgress}</Tag>
                                </div>
                                <Divider style={{ margin: '8px 0' }} />

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Space>
                                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                        <Typography.Text>Resolvidos</Typography.Text>
                                    </Space>
                                    <Tag color="green">{statusStats.resolved}</Tag>
                                </div>
                                <Divider style={{ margin: '8px 0' }} />

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Space>
                                        <InboxOutlined style={{ color: '#8c8c8c' }} />
                                        <Typography.Text>Arquivados</Typography.Text>
                                    </Space>
                                    <Tag color="default">{statusStats.archived}</Tag>
                                </div>
                            </Space>
                        </Card>
                    </Col>

                    <Col xs={24} md={10}>
                        <Card title="Ações Rápidas" style={{ height: '100%' }}>
                            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                <Button
                                    block
                                    icon={<AuditOutlined />}
                                    onClick={() => navigate('/records')}
                                >
                                    Gerenciar Relatos
                                </Button>
                                <Button
                                    block
                                    icon={<UserOutlined />}
                                    onClick={() => navigate('/people')}
                                >
                                    Gerenciar Pessoas
                                </Button>
                                <Button
                                    block
                                    icon={<BuildOutlined />}
                                    onClick={() => navigate('/companies')}
                                >
                                    Gerenciar Empresas
                                </Button>
                            </Space>
                        </Card>
                    </Col>
                </Row>
            </Spin>

            <Alert
                type="warning"
                showIcon
                message="Aviso sobre os dados de exemplo"
                description="Os dados cadastrados neste ambiente são meramente ilustrativos e foram gerados para fins de desenvolvimento e teste. Empresas, relatos e demais informações são fictícios. Qualquer semelhança com pessoas, empresas ou situações reais é mera coincidência."
            />
        </Space>
    );
}
