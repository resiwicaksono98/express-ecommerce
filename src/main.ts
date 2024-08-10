import {app} from './application/app'
import { logger } from './application/logging';

const port = process.env.APP_PORT || 3000;

app.listen(port, () => {
  logger.info("Listening on port " + port);
})
