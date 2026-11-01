import { useState } from 'react';

import { App, Button, Popconfirm, Space, Tooltip } from 'antd';

import { DeleteOutlined, EditOutlined, TeamOutlined } from '@ant-design/icons';
import { handleServiceError, hasServiceError } from '@domain/@shared/service.helper';
import { sleep } from '@domain/@shared/sleep';

import { deleteRecord } from '../api/delete-record.service';
import type { Record } from '../record.type';
import { useRecordsContext } from '../Records.context';

type Props = {
    record: Record.Model;
    onOpenInvolvements?: (record: Record.Model) => void;
};

export function RecordsActionsCell({ record, onOpenInvolvements }: Props) {
    const [isPopconfirmVisible, setIsPopconfirmVisible] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const { setRecordId, setIsEditModalVisible, fetchRecords } = useRecordsContext();

    const app = App.useApp();

    const handleEdit = () => {
        setRecordId(record.id);
        setIsEditModalVisible(true);
    };

    const handleDelete = async () => {
        setIsSending(true);

        const response = await deleteRecord(record.id);

        await sleep(1000);

        setIsSending(false);

        if (hasServiceError(response))
            return handleServiceError(app, response);

        setIsPopconfirmVisible(false);
        fetchRecords();
    };

    return (
        <Space size="middle">
            {onOpenInvolvements && (
                <Tooltip title="Pessoas Envolvidas">
                    <Button
                        type="text"
                        icon={<TeamOutlined />}
                        onClick={() => onOpenInvolvements(record)}
                    />
                </Tooltip>
            )}

            <Tooltip title="Editar">
                <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={handleEdit}
                />
            </Tooltip>

            <Popconfirm
                title="Excluir relato"
                description="Tem certeza que deseja excluir o relato?"
                open={isPopconfirmVisible}
                placement="left"
                cancelText="Não"
                okText="Sim"
                okType="danger"
                okButtonProps={{ loading: isSending }}
                onConfirm={handleDelete}
                onCancel={() => setIsPopconfirmVisible(false)}
            >
                <Tooltip title="Excluir">
                    <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        onClick={() => setIsPopconfirmVisible(true)}
                    />
                </Tooltip>
            </Popconfirm>
        </Space>
    );
}
