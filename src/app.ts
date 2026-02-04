import express, { NextFunction, Request, Response } from 'express'
import cookieParser from 'cookie-parser'
import categoryRoute from './category/category-router'
import { globalErrorHandler } from './common/middlewares/globalErrorHandler'
const app = express()

app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) => {
    res.send('Welcome to catalog service')
})

app.use('/categories', categoryRoute)

app.use(globalErrorHandler)

export default app
