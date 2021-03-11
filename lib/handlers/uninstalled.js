'use strict'

const db = require('../db')

/**
 * Handler called when an app is uninstalled from an account. In this case we remove the
 * association between the Zoom user and installed app instances from the database
 */
module.exports = async (context, uninstallData) => {
	await db.deleteZoomUser(context.installedAppId)
}
