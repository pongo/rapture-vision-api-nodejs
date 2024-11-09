export function formatErr<T, E>(res: Result<T, E>): string;

export function createLogManager(): { silent: () => void; restore: () => void };
