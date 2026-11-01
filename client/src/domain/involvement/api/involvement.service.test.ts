import { Request } from '@domain/@shared/request';
import { describe, expect, it, vi } from 'vitest';

import { createInvolvement } from './create-involvement.service';
import { deleteInvolvement } from './delete-involvement.service';
import { listInvolvements } from './list-involvements.service';

vi.mock('@domain/@shared/request', () => ({
    Request: {
        get: vi.fn(),
        post: vi.fn(),
        delete: vi.fn(),
    },
}));

describe('Involvement API Services', () => {
    it('listInvolvements deve chamar Request.get com a rota correta do relato', async () => {
        const mockData = {
            involvements: [],
            is_anonymous: true,
        };

        vi.mocked(Request.get).mockResolvedValueOnce({
            statusCode: 200,
            data: mockData,
        });

        const response = await listInvolvements(1);

        expect(Request.get).toHaveBeenCalledWith('/records/1/involvements');
        expect(response).toEqual({
            statusCode: 200,
            data: mockData,
        });
    });

    it('createInvolvement deve chamar Request.post com payload correto', async () => {
        const payload = {
            person_id: 2,
            type: 'whistleblower' as const,
        };

        vi.mocked(Request.post).mockResolvedValueOnce({
            statusCode: 201,
            data: { involvement: { id: 10, record_id: 1, ...payload } },
        });

        const response = await createInvolvement(1, payload);

        expect(Request.post).toHaveBeenCalledWith('/records/1/involvements', payload);
        expect(response).toEqual({
            statusCode: 201,
            data: { involvement: { id: 10, record_id: 1, ...payload } },
        });
    });

    it('deleteInvolvement deve chamar Request.delete com recordId e involvementId', async () => {
        vi.mocked(Request.delete).mockResolvedValueOnce({
            statusCode: 200,
        });

        const response = await deleteInvolvement(1, 10);

        expect(Request.delete).toHaveBeenCalledWith('/records/1/involvements/10');
        expect(response).toEqual({
            statusCode: 200,
        });
    });
});
