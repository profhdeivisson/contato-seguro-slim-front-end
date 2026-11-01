export namespace Person {
    export type Model = {
        id: number;
        name: string;
        cpf: string;
        email: string;
        birth_date: string;
        created_at: string;
        updated_at: string | null;
        deleted_at: string | null;
    };
}
