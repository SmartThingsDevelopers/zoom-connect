'use strict'

const db = require('../db')

const ST_CALLBACK = process.env.ST_CALLBACK
const ZOOM_AUTH_URL = process.env.ZOOM_AUTH_URL
const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID

/**
 * Defines the SmartApp configuration pages. In this case we check whether or not the user has authenticated
 * with Zoom. If so then we render the SmartThings device and scene options. If not then we render
 * the link to the authentication page.
 */
module.exports = {
	mainPage: async (context, page) => {
		const user = await db.getZoomUser(context.installedAppId)
		if (user) {
			page.section('deviceName', section => {
				section.paragraphSetting('deviceInfo')
				section.textSetting('deviceName')
					.defaultValue(`Zoom (${user.email})`)
				section.paragraphSetting('automationInfo')
			});

			// The account exists, so OAuth has been completed. Show options for controlling devices and scenes.
			page.section('onJoin', section => {

				section.sceneSetting('joinScenes')
					.multiple(true)
					.required(false)

				section.deviceSetting('joinOnSwitches')
					.capability('switch')
					.permissions('rx')
					.multiple(true)
					.required(false)

				section.deviceSetting('joinOffSwitches')
					.capability('switch')
					.permissions('rx')
					.multiple(true)
					.required(false)
			});

			page.section('onLeave', section => {

				section.sceneSetting('leaveScenes')
					.multiple(true)
					.required(false)

				section.deviceSetting('leaveOnSwitches')
					.capability('switch')
					.permissions('rx')
					.multiple(true)
					.required(false)

				section.deviceSetting('leaveOffSwitches')
					.capability('switch')
					.permissions('rx')
					.multiple(true)
					.required(false)
			});
		} else {
			// If the account does not exist, prompt the user to log in via the OAuth process

			// Image heading
			// page.section('heading', section => {
			// 	section.imageSetting('zoom').image(`${SERVER_URL}/images/zoom.png`)
			// });

			page.section('introduction', section => {
				section.paragraphSetting('introduction')
			});

			// Link to the OAuth server
			page.section('oauth', section => {
				// The SmartThings URL to redirect back to after login, to complete the OAuth process
				const redirectUri = encodeURIComponent(ST_CALLBACK)

				// The URL of the OAuth server. The "scope" parameter in this case is whatever is required by the cloud
				// you are integrating with. So not include SmartThings app scopes here. Those are specified in the
				// SmartApp implementation
				const url = `${ZOOM_AUTH_URL}?response_type=code&client_id=${ZOOM_CLIENT_ID}&redirect_uri=${encodeURIComponent(ST_CALLBACK)}`
				section.oauthSetting('link').urlTemplate(url)
			});
		}
	}
}
