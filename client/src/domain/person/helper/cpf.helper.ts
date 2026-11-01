export function sanitizeCpf(value: string): string {
    return value.replace(/\D/g, '');
}

export function formatCpf(value: string): string {
    const digits = sanitizeCpf(value).slice(0, 11);

    if (digits.length <= 3) {
        return digits;
    }

    if (digits.length <= 6) {
        return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    }

    if (digits.length <= 9) {
        return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    }

    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

export function isValidCpf(value: string): boolean {
    const digits = sanitizeCpf(value);

    if (digits.length !== 11) {
        return false;
    }

    if (/^(\d)\1{10}$/.test(digits)) {
        return false;
    }

    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += Number(digits[i]) * (10 - i);
    }

    let firstCheck = (sum * 10) % 11;
    if (firstCheck === 10 || firstCheck === 11) {
        firstCheck = 0;
    }

    if (firstCheck !== Number(digits[9])) {
        return false;
    }

    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += Number(digits[i]) * (11 - i);
    }

    let secondCheck = (sum * 10) % 11;
    if (secondCheck === 10 || secondCheck === 11) {
        secondCheck = 0;
    }

    return secondCheck === Number(digits[10]);
}
