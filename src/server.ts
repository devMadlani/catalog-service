'use strict'

import app from './app'
import config from 'config'
import logger from './config/logger'
import { initDb } from './config/db'

const startServer = async () => {
    const PORT: number = config.get('server.port') || 5502
    try {
        await initDb()
        logger.info('Databse connected successfully')
        app.listen(PORT, () => {
            logger.info('Listing on port', { port: PORT })
        })
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.message)
            logger.on('finish', () => {
                process.exit(1)
            })
        }
    }
}

void startServer()
