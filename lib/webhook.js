'use strict'

const db = require('./db')
const smartApp = require('./smartapp')
const utils = require('./utils')

/**
 * Defines the handler for web-hook calls from Zoom
 * @type {{handleEvent(*): Promise<void>}}
 */
module.exports = {
	async handleEvent(data) {
		// Check for the relevant event type.
		if (data.event === 'user.presence_status_updated') {

			// Retrieve list of installed apps for this user. There can be more then one if
			// the user installs the app in multiple locations
			const installations = await db.getInstalledAppIds(data.payload.object.id)

			// for each installed instance
			await Promise.all(installations.map(async (isa) => {

				// Get the installed app context from the SmartApp context store
				const ctx = await smartApp.withContext(isa)

				// Check against the last value and update device state
				const inMeetingStateChanged = await updateDevice(ctx, data.payload.object.id, data.payload.object.presence_status)

				// Execute actions if state changed
				if (inMeetingStateChanged) {
					if (isInProgress(data.payload.object.presence_status)) {
						// Meeting has started. Execute the configured scenes and device commands
						return Promise.all([
							executeScenes(ctx, ctx.config.joinScenes),
							ctx.api.devices.sendCommands(ctx.config.joinOnSwitches, 'switch', 'on'),
							ctx.api.devices.sendCommands(ctx.config.joinOffSwitches, 'switch', 'off')
						])
					} else {
						// Meeting has ended. Execute the configured scenes and device commands
						return Promise.all([
							executeScenes(ctx, ctx.config.leaveScenes),
							ctx.api.devices.sendCommands(ctx.config.leaveOnSwitches, 'switch', 'on'),
							ctx.api.devices.sendCommands(ctx.config.leaveOffSwitches, 'switch', 'off')
						])

					}
				}
			}))
		}
	}
}

/**
 * Scene execution utility function
 * @param ctx the SmartApp context
 * @param sceneConfig the scene configuration object
 * @returns {Promise<Status[]>}
 */
async function executeScenes(ctx, sceneConfig) {
	if (sceneConfig) {
		return Promise.all(sceneConfig.map(it => {
			return ctx.api.scenes.execute(it.sceneConfig.sceneId)
		}))
	}
}

async function updateDevice(ctx, userId, value) {
	const device = await utils.getZoomDevice(ctx, userId)
	if (device) {
		const status = await ctx.api.devices.getCapabilityStatus(device.deviceId, 'main', 'bobflorian.zoomPresenceStatus')
		if (status.presenceStatus.value !== value) {
			const deviceEvents = [
				{
					component: 'main',
					capability: 'bobflorian.zoomPresenceStatus',
					attribute: 'inProgress',
					value: isInProgress(value) ? 'Yes' : 'No'
				},
				{
					component: 'main',
					capability: 'bobflorian.zoomPresenceStatus',
					attribute: 'presenceStatus',
					value: value
				}
			]
			await ctx.api.devices.createEvents(device.deviceId, deviceEvents)
			return isInProgress(status.presenceStatus.value) !== isInProgress(value)
		}
	} else {
		log.warn(`Device for user '${userId}' not found`)
	}
	return false
}

function isInProgress(status) {
	return ['In_Meeting', 'Presenting', 'On_Phone_Call'].includes(status)
}
