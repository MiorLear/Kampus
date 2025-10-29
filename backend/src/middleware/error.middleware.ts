import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  status?: number;
}

/**
 * Middleware para manejo centralizado de errores
 */
export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  const statusCode = error.statusCode || error.status || 500;
  const message = error.message || 'Internal Server Error';

  // Error de validación
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: message,
    });
  }

  // Error de Firebase/Firestore
  if (error.message?.includes('firestore') || error.message?.includes('Firebase')) {
    return res.status(500).json({
      error: 'Database Error',
      message: 'An error occurred while accessing the database',
    });
  }

  // Error genérico
  res.status(statusCode).json({
    error: 'Error',
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

/**
 * Wrapper para manejar errores asíncronos en routes
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};


