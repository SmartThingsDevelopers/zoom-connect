'use strict'

module.exports = {
	async getZoomDevice(context, userId) {
		const devices = (await context.api.devices.list({installedAppId: context.installedAppId})).filter(it => {
			return it.app &&
				it.app.profile.id === process.env.DEVICE_PROFILE_ID &&
				it.app.externalId.toLowerCase() === userId.toLowerCase()
		})

		if (devices.length > 0) {
			return devices[0]
		}
	}
}
