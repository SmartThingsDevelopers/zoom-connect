'use strict'

const axios = require('axios')
const qs = require('querystring')
const db = require('../db')
const zoom = require('../zoom')

/**
 * Handler called after SmartThings receives the redirect from the OAuth login page.
 * It exchanges the code received in the redirect query string for access and refresh
 * tokens from Zoom, and uses those tokens to get information about the authenticating
 * user, which is associated with the installed app instance in the database. The tokens
 * themselves are not stored because they are not needed again.
 */
module.exports = async (context, event) => {
	let params = qs.parse(event.urlPath);

	try {
		const data = await zoom.redeemCode(params.code)
		//console.log(`DATA: ${JSON.stringify(data, null, 2)}`)
		const user = await zoom.getUser(data.access_token)
		//console.log(`USER: ${JSON.stringify(user, null, 2)}`)
		db.putZoomUser(user, event.installedAppId)
	} catch (e) {
		console.log('Error authenticating with Zoom', e.message, e.stack)
	}
}
