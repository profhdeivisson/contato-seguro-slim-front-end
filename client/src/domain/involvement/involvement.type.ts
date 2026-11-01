import type { Person } from '@domain/person/person.type';

export namespace Involvement {
    export type Type = 'whistleblower' | 'witness' | 'victim' | 'denounced';

    export type Model = {
        id: number;
        type: Type;
        record_id: number;
        person_id: number;
        created_at: string;
        updated_at: string | null;
        deleted_at: string | null;
        person: Person.Model;
    };
}

export const INVOLVEMENT_TYPE_LABELS: Record<Involvement.Type, string> = {
    whistleblower: 'Relatante',
    witness: 'Testemunha',
    victim: 'Vítima',
    denounced: 'Denunciado',
};

export const INVOLVEMENT_TYPE_COLORS: Record<Involvement.Type, string> = {
    whistleblower: 'blue',
    witness: 'purple',
    victim: 'orange',
    denounced: 'red',
};
