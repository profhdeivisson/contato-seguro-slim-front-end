import { Request } from '@domain/@shared/request';
import type { Service } from '@domain/@shared/service.type';

type Response =
    | Service.DefaultResponse
    | Service.ExceptionResponse;

/**
 * @service
 * @route /records/:record_id/involvements/:id
 * @http DELETE
 */
export const deleteInvolvement = (
    recordId: number,
    id: number,
): Promise<Response> => Request.delete(`/records/${recordId}/involvements/${id}`);
