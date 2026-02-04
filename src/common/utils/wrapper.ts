import { NextFunction, Request, RequestHandler, Response } from 'express'
import createHttpError from 'http-errors'

export const asyncWrapper = (requestHandler: RequestHandler) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(requestHandler(req, res, next)).catch((error) => {
            if (error instanceof Error) {
                next(createHttpError(500, error.message))
            } else {
                next(createHttpError(500, 'Failed to create category'))
            }
        })
    }
}
