'use strict'

const db = require('../db')
const utils = require('../utils')

/**
 * Handler called whenever app is installed or updated.
 * It reads the Zoom username from the database and uses it to construct a unique installed app
 * display name, such as "Zoom (someone@whatever.com)"
 */
module.exports = async (context) => {
	const user = await db.getZoomUser(context.installedAppId)
	const device = await utils.getZoomDevice(context, user.id)
	if (device) {
		if (device.label !== context.configStringValue('deviceName')) {
			await context.api.devices.update(device.deviceId,
				{label: context.configStringValue('deviceName')})
		}
	} else {
		const device = await context.api.devices.create({
			label: context.configStringValue('deviceName'),
			app: {
				profileId: process.env.DEVICE_PROFILE_ID,
				externalId: user.id
			}
		})

		await context.api.devices.createEvents(device.deviceId, [
			{
				component: 'main',
				capability: 'bobflorian.zoomPresenceStatus',
				attribute: 'inProgress',
				value: 'No'
			},
			{
				component: 'main',
				capability: 'bobflorian.zoomPresenceStatus',
				attribute: 'presenceStatus',
				value: 'Available'
			}
		])
	}
	await context.api.installedApps.update(context.installedAppId,
		{displayName: context.configStringValue('deviceName')})
}
