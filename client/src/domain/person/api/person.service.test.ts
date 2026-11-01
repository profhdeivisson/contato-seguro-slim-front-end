import { describe, expect, it, vi } from 'vitest';

import { Request } from '@domain/@shared/request';

import { createPerson } from './create-person.service';
import { deletePerson } from './delete-person.service';
import { findPerson } from './find-person.service';
import { listPeople } from './list-people.service';
import { updatePerson } from './update-person.service';

vi.mock('@domain/@shared/request', () => ({
    Request: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}));

describe('Person API Services', () => {
    it('listPeople deve chamar Request.get com a rota correta', async () => {
        vi.mocked(Request.get).mockResolvedValueOnce({
            statusCode: 200,
            data: { people: [] },
        });

        const response = await listPeople();

        expect(Request.get).toHaveBeenCalledWith('/people');
        expect(response).toEqual({
            statusCode: 200,
            data: { people: [] },
        });
    });

    it('findPerson deve chamar Request.get com o ID da pessoa', async () => {
        vi.mocked(Request.get).mockResolvedValueOnce({
            statusCode: 200,
            data: { person: { id: 1, name: 'Ana Silva' } },
        });

        const response = await findPerson(1);

        expect(Request.get).toHaveBeenCalledWith('/people/1');
        expect(response).toEqual({
            statusCode: 200,
            data: { person: { id: 1, name: 'Ana Silva' } },
        });
    });

    it('createPerson deve chamar Request.post com payload correto', async () => {
        const payload = {
            name: 'Ana Silva',
            cpf: '12345678901',
            email: 'ana.silva@example.com',
            birth_date: '1990-03-15',
        };

        vi.mocked(Request.post).mockResolvedValueOnce({
            statusCode: 201,
            data: { person: { id: 1, ...payload } },
        });

        const response = await createPerson(payload);

        expect(Request.post).toHaveBeenCalledWith('/people', payload);
        expect(response).toEqual({
            statusCode: 201,
            data: { person: { id: 1, ...payload } },
        });
    });

    it('updatePerson deve chamar Request.put com id e payload correto', async () => {
        const payload = {
            name: 'Ana Silva Atualizada',
            cpf: '12345678901',
            email: 'ana.atualizada@example.com',
            birth_date: '1990-03-15',
        };

        vi.mocked(Request.put).mockResolvedValueOnce({
            statusCode: 200,
            data: { person: { id: 1, ...payload } },
        });

        const response = await updatePerson(1, payload);

        expect(Request.put).toHaveBeenCalledWith('/people/1', payload);
        expect(response).toEqual({
            statusCode: 200,
            data: { person: { id: 1, ...payload } },
        });
    });

    it('deletePerson deve chamar Request.delete com id da pessoa', async () => {
        vi.mocked(Request.delete).mockResolvedValueOnce({
            statusCode: 200,
        });

        const response = await deletePerson(1);

        expect(Request.delete).toHaveBeenCalledWith('/people/1');
        expect(response).toEqual({
            statusCode: 200,
        });
    });
});
