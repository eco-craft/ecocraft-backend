import 'dotenv/config';
import { logger } from './application/logging';
import { web } from './application/web';

require('dotenv').config();

const PORT = 8080;

const server = web.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});

server.timeout = 600000;