import { Request } from '@domain/@shared/request';
import type { Service } from '@domain/@shared/service.type';

import type { Person } from '../person.type';

type Body = Pick<Person.Model, 'name' | 'cpf' | 'email' | 'birth_date'>;

type Data = { person: Person.Model };

type Response =
    | Service.DefaultResponse<Data>
    | Service.ExceptionResponse;

/**
 * @service
 * @route /people
 * @http POST
 */
export const createPerson = (
    body: Body,
): Promise<Response> => Request.post('/people', body);
