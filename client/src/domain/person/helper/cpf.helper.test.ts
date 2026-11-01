import { describe, expect, it } from 'vitest';

import { formatCpf, isValidCpf, sanitizeCpf } from './cpf.helper';

describe('cpf.helper', () => {
    describe('sanitizeCpf', () => {
        it('deve remover pontuação e caracteres não numéricos', () => {
            expect(sanitizeCpf('123.456.789-01')).toBe('12345678901');
            expect(sanitizeCpf(' 123.456.789-01 ')).toBe('12345678901');
            expect(sanitizeCpf('abc-123.456.789-01-xyz')).toBe('12345678901');
        });

        it('deve retornar string vazia para entradas vazias ou sem números', () => {
            expect(sanitizeCpf('')).toBe('');
            expect(sanitizeCpf('abc-def')).toBe('');
        });
    });

    describe('formatCpf', () => {
        it('deve formatar 11 dígitos numéricos com máscara padrão 000.000.000-00', () => {
            expect(formatCpf('12345678901')).toBe('123.456.789-01');
        });

        it('deve formatar parcialmente durante a digitação', () => {
            expect(formatCpf('123')).toBe('123');
            expect(formatCpf('1234')).toBe('123.4');
            expect(formatCpf('123456')).toBe('123.456');
            expect(formatCpf('1234567')).toBe('123.456.7');
            expect(formatCpf('123456789')).toBe('123.456.789');
            expect(formatCpf('1234567890')).toBe('123.456.789-0');
        });

        it('deve limitar a formatação ao máximo de 11 dígitos', () => {
            expect(formatCpf('123456789019999')).toBe('123.456.789-01');
        });

        it('deve retornar string vazia para entrada vazia', () => {
            expect(formatCpf('')).toBe('');
        });
    });

    describe('isValidCpf', () => {
        it('deve retornar true para CPFs válidos', () => {
            expect(isValidCpf('52998224725')).toBe(true);
            expect(isValidCpf('529.982.247-25')).toBe(true);
        });

        it('deve retornar false se o CPF não tiver 11 dígitos', () => {
            expect(isValidCpf('123456')).toBe(false);
            expect(isValidCpf('123456789012')).toBe(false);
            expect(isValidCpf('')).toBe(false);
        });

        it('deve retornar false para CPFs com todos os dígitos iguais', () => {
            expect(isValidCpf('11111111111')).toBe(false);
            expect(isValidCpf('00000000000')).toBe(false);
            expect(isValidCpf('99999999999')).toBe(false);
        });

        it('deve retornar false para CPFs com dígitos verificadores inválidos', () => {
            expect(isValidCpf('12345678900')).toBe(false);
            expect(isValidCpf('52998224726')).toBe(false);
        });
    });
});
