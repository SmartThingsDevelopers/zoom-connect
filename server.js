'use strict';

require('dotenv').config();
const app = require('./app')
const PORT = process.env.PORT || 3000;

/**
 * Starts an express server for local testing
 */

app.listen(PORT, () => {
	console.log(`Server is up and running at http://localhost:${PORT}`)
	console.log(`Zoom web-hook:        ${process.env.SERVER_URL}/webhook`)
});