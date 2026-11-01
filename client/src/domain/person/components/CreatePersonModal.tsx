import { useState } from 'react';

import { App, Divider, Form, Modal } from 'antd';

import { handleServiceError, hasServiceError } from '@domain/@shared/service.helper';
import type { Service } from '@domain/@shared/service.type';
import { sleep } from '@domain/@shared/sleep';
import dayjs from 'dayjs';

import { createPerson } from '../api/create-person.service';
import { sanitizeCpf } from '../helper/cpf.helper';
import { usePeopleContext } from '../People.context';
import { PersonFields, type Values } from './PersonFields';

export function CreatePersonModal() {
    const [isSending, setIsSending] = useState(false);

    const { setIsCreateModalVisible, fetchPeople } = usePeopleContext();

    const [form] = Form.useForm<Values>();

    const app = App.useApp();

    const close = () => setIsCreateModalVisible(false);

    const makeErrorMessage = (exception: Service.ServerException) => {
        if (exception.statusCode === 409) {
            return 'Este CPF já está cadastrado no sistema.';
        }
        return null;
    };

    const onFinish = async (values: Values) => {
        setIsSending(true);

        const payload = {
            name: values.name,
            cpf: sanitizeCpf(values.cpf),
            email: values.email,
            birth_date: dayjs(values.birth_date).format('YYYY-MM-DD'),
        };

        const response = await createPerson(payload);

        await sleep(500);

        setIsSending(false);

        if (hasServiceError(response))
            return handleServiceError(app, response, makeErrorMessage);

        app.notification.success({
            message: 'Sucesso!',
            description: 'Pessoa cadastrada com sucesso.',
        });

        close();
        fetchPeople();
    };

    return (
        <Modal
            open
            title="Cadastrar pessoa"
            confirmLoading={isSending}
            onOk={form.submit}
            okText="Cadastrar"
            onCancel={close}
            cancelText="Cancelar"
        >
            <Divider />

            <Form
                form={form}
                onFinish={onFinish}
                name="createPerson"
                layout="vertical"
                autoComplete="off"
            >
                <PersonFields />
            </Form>
        </Modal>
    );
}
