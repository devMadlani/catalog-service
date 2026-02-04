import express, { NextFunction, Request, Response } from 'express'
import logger from './config/logger'
import { HttpError } from 'http-errors'
import categoryRoute from './category/category-router'
const app = express()

app.use(express.json())

app.get('/', (req, res) => {
    res.send('Welcome to catalog service')
})

app.use('/categories', categoryRoute)

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message)
    const statusCode = err.statusCode || 500

    res.status(statusCode).json({
        errors: [
            {
                type: err.name,
                msg: err.message,
                path: '',
                location: '',
            },
        ],
    })
})

export default app
