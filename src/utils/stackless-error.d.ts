/**
 * Аналог ошибки, но без сбора стектрейса (его сбор занимает много времени, а нужен не всегда).
 */
export declare class StacklessError {
    readonly data?: unknown;
    readonly message: string;
    readonly name: string;
    constructor(message?: string, data?: unknown);
}
export { StacklessError as SE };
