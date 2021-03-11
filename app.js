'use strict';

require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const path = require('path')
const smartApp = require('./lib/smartapp');
const webHook = require('./lib/webhook')
const deauthorize = require('./lib/deauthorize')
const verificationToken = process.env.ZOOM_VERIFICATION_TOKEN

/**
 * Express server definition. The express server handles SmartApp lifecycle events
 * and web-hook call from Zoom
 */

// Configure the Express web server
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('dev'));

// Handles lifecycle event requests from SmartThings
app.post('/smartapp', (req, res, next) => {
	smartApp.handleHttpCallback(req, res);
});

// Handles event callbacks from Zoom
app.post('/webhook', async (req, res, next) => {
	console.debug('WEBHOOK', JSON.stringify(req.body))
	try {
		if (req.headers.authorization === verificationToken) {
			await webHook.handleEvent(req.body)
		} else {
			console.warn(`Invalid verification token: "${req.headers.authorization}"` )
		}
	} catch (e) {
		console.error('Error event handling webhook', e)
	}
	res.send({status: 'OK'})
});

// Handles deauthorization callbacks from Zoom
app.post('/deauthorized', async (req, res, next) => {
	console.debug('DEAUTHORIZE', JSON.stringify(req.body))
	try {
		if (req.headers.authorization === verificationToken) {
			await deauthorize.handleEvent(req.body)
		} else {
			console.warn(`Invalid verification token: "${req.headers.authorization}"` )
		}
	} catch (e) {
		console.error('Error deauthorize handling webhook', e)
	}
	res.send({status: 'OK'})
});

module.exports = app;