import { Fragment } from 'react';

import { DatePicker, Form, Input } from 'antd';

import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

import { formatCpf, isValidCpf, sanitizeCpf } from '../helper/cpf.helper';

export type Values = {
    name: string;
    cpf: string;
    email: string;
    birth_date: Dayjs;
};

export function PersonFields() {
    return (
        <Fragment>
            <Form.Item<Values>
                name="name"
                label="Nome Completo"
                rules={[{ required: true, message: 'Por favor, digite o nome completo.' }]}
            >
                <Input placeholder="Nome completo da pessoa" />
            </Form.Item>

            <Form.Item<Values>
                name="cpf"
                label="CPF"
                normalize={formatCpf}
                rules={[
                    { required: true, message: 'Por favor, digite o CPF.' },
                    {
                        validator: (_, value) => {
                            if (!value) return Promise.resolve();
                            const sanitized = sanitizeCpf(value);
                            if (sanitized.length !== 11) {
                                return Promise.reject(new Error('O CPF deve ter exatamente 11 dígitos.'));
                            }
                            if (!isValidCpf(value)) {
                                return Promise.reject(new Error('CPF inválido.'));
                            }
                            return Promise.resolve();
                        },
                    },
                ]}
            >
                <Input placeholder="000.000.000-00" maxLength={14} />
            </Form.Item>

            <Form.Item<Values>
                name="email"
                label="E-mail"
                rules={[
                    { required: true, message: 'Por favor, digite um e-mail.' },
                    { type: 'email', message: 'Por favor, digite um e-mail válido.' },
                ]}
            >
                <Input placeholder="exemplo@email.com" />
            </Form.Item>

            <Form.Item<Values>
                name="birth_date"
                label="Data de Nascimento"
                rules={[{ required: true, message: 'Por favor, selecione a data de nascimento.' }]}
            >
                <DatePicker
                    format="DD/MM/YYYY"
                    placeholder="Selecione a data"
                    style={{ width: '100%' }}
                    maxDate={dayjs()}
                />
            </Form.Item>
        </Fragment>
    );
}
