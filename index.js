'use strict'

const awsServerlessExpress = require('aws-serverless-express')
const app = require('./app')
const smartApp = require('./lib/smartapp');
const webserver = awsServerlessExpress.createServer(app)

/**
 * Defines handlers for deployment of the app as AWS Lambdas.
 */

/**
 * Handles SmartApp lifecycle events
 */
module.exports.smartapp = (event, context, callback) => {
	smartApp.handleLambdaCallback(event, context, callback);
};

/**
 * Handles web-hook calls from Zoom
 */
module.exports.webapp = (event, context) => {
	awsServerlessExpress.proxy(webserver, event, context)
};