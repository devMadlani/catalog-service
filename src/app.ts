import express, { NextFunction, Request, Response } from 'express'
import cookieParser from 'cookie-parser'
import categoryRouter from './category/category-router'
import productRouter from './product/product-router'
import toppingRouter from './toppings/topping-route'
import { globalErrorHandler } from './common/middlewares/globalErrorHandler'
const app = express()

app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) => {
    res.send('Welcome to catalog service')
})

app.use('/categories', categoryRouter)
app.use('/products', productRouter)
app.use('/toppings', toppingRouter)

app.use(globalErrorHandler)

export default app
