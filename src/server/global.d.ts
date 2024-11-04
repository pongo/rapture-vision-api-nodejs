declare global {
  namespace Express {
    interface Request {
      safeData: any;
    }
  }
}

export {};
