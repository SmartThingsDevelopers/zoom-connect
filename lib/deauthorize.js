'use strict'

const db = require('./db')
const smartApp = require('./smartapp')
const zoom = require('./zoom')

/**
 * Defines the handler for web-hook deauthorize from Zoom
 * @type {{handleEvent(*): Promise<void>}}
 */
module.exports = {
	async handleEvent(data) {
		// Check for the relevant event type.
		if (data.event === 'app_deauthorized') {

			// Retrieve list of installed apps for this user. There can be more then one if
			// the user installs the app in multiple locations
			const installations = await db.getInstalledAppIds(data.payload.user_id)

			// for each installed instance
			await Promise.all(installations.map(async (isa) => {

				// Get the installed app context from the SmartApp context store
				const ctx = await smartApp.withContext(isa)

				// Delete this instance
				return ctx.api.installedApps.delete(isa)
			}))

			await zoom.notifyOfDataDelete(data.payload)
		}
	}
}
