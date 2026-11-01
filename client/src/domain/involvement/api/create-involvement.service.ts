import { Request } from '@domain/@shared/request';
import type { Service } from '@domain/@shared/service.type';

import type { Involvement } from '../involvement.type';

type Body = {
    person_id: number;
    type: Involvement.Type;
};

type Data = {
    involvement: Involvement.Model;
};

type Response =
    | Service.DefaultResponse<Data>
    | Service.ExceptionResponse;

/**
 * @service
 * @route /records/:record_id/involvements
 * @http POST
 */
export const createInvolvement = (
    recordId: number,
    body: Body,
): Promise<Response> => Request.post(`/records/${recordId}/involvements`, body);
