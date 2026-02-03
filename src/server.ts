'use strict'

import app from './app'
import config from 'config'
import logger from './config/logger'

const startServer = () => {
    const PORT: number = config.get('server.port') || 5502
    try {
        app.listen(PORT, () => {
            logger.info('Listing on port', { port: PORT })
        })
    } catch (error) {
        process.exit(1)
    }
}

startServer()
