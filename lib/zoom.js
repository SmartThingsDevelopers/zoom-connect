'use strict'

const axios = require('axios')
const ST_CALLBACK = process.env.ST_CALLBACK
const ZOOM_API_URL = process.env.ZOOM_API_URL
const ZOOM_TOKEN_URL = process.env.ZOOM_TOKEN_URL
const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET
const basicAuthorization = 'Basic ' + Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64')
/**
 * Defines Zoom API methods
 */
module.exports = {

	/**
	 * Exchange the code received from the OAuth2 redirect for access and refresh tokens
	 * @param code OAuth2 authorization code
	 * @returns {Promise<AxiosResponse<any>>}
	 */
	redeemCode(code) {
		const config = {
			method: 'POST',
			url: ZOOM_TOKEN_URL,
			headers: {
				Authorization: basicAuthorization
			},
			params: {
				grant_type: "authorization_code",
				code: code,
				redirect_uri: ST_CALLBACK
			}
		}

		return axios.request(config).then(resp => resp.data)
	},

	/**
	 * Get user information for the authenticated user
	 * @param accessToken
	 * @returns {Promise<{id, email, ...}>}
	 */
	getUser(accessToken) {
		const config = {
			method: 'GET',
			url: `${ZOOM_API_URL}/v2/users/me`,
			headers: {
				Authorization: 'Bearer ' + accessToken
			}
		}

		return axios.request(config).then(resp => resp.data)
	},

	/**
	 * Notify Zoom of data deletion compliance
	 */
	notifyOfDataDelete(payload) {
		const data = {
			client_id: payload.client_id,
			user_id: payload.user_id,
			account_id: payload.account_id,
			deauthorization_event_received: payload,
			compliance_completed: true
		}
		const config = {
			method: 'POST',
			url: `${ZOOM_API_URL}/oauth/data/compliance`,
			headers: {
				'Authorization': basicAuthorization,
				'Content-Type': 'application/json'
			},
			data
		}

		return axios.request(config).then(resp => resp.data)
	}
}
