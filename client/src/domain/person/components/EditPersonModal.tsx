import { useMemo, useState } from 'react';

import { App, Divider, Form, Modal } from 'antd';

import { handleServiceError, hasServiceError } from '@domain/@shared/service.helper';
import type { Service } from '@domain/@shared/service.type';
import { sleep } from '@domain/@shared/sleep';
import dayjs from 'dayjs';

import { updatePerson } from '../api/update-person.service';
import { formatCpf, sanitizeCpf } from '../helper/cpf.helper';
import { usePeopleContext } from '../People.context';
import { PersonFields, type Values } from './PersonFields';

export function EditPersonModal() {
    const [isSending, setIsSending] = useState(false);

    const {
        person,
        setIsEditModalVisible,
        setPersonId,
        fetchPeople,
    } = usePeopleContext();

    if (!person)
        throw new Error('Value of the `person` property is unknown');

    const app = App.useApp();

    const [form] = Form.useForm<Values>();

    const close = () => {
        setIsEditModalVisible(false);
        setPersonId(null);
    };

    const initialValues = useMemo(() => ({
        name: person.name,
        cpf: formatCpf(person.cpf),
        email: person.email,
        birth_date: dayjs(person.birth_date),
    }), [person]);

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

        const response = await updatePerson(person.id, payload);

        await sleep(500);

        setIsSending(false);

        if (hasServiceError(response))
            return handleServiceError(app, response, makeErrorMessage);

        app.notification.success({
            message: 'Sucesso!',
            description: 'Dados da pessoa atualizados com sucesso.',
        });

        close();
        fetchPeople();
    };

    return (
        <Modal
            open
            title="Editar pessoa"
            confirmLoading={isSending}
            onOk={form.submit}
            okText="Confirmar"
            onCancel={close}
            cancelText="Cancelar"
        >
            <Divider />

            <Form
                form={form}
                onFinish={onFinish}
                name="editPerson"
                layout="vertical"
                autoComplete="off"
                initialValues={initialValues}
            >
                <PersonFields />
            </Form>
        </Modal>
    );
}
