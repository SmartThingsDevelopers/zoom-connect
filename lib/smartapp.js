'use strict'

const DynamoDBContextStore = require('@smartthings/dynamodb-context-store')
const SmartApp = require('@smartthings/smartapp');
const oauthHandler = require('./handlers/oauth')
const pageHandlers = require('./handlers/pages')
const updatedHandler = require('./handlers/updated')
const uninstalledHandler = require('./handlers/uninstalled')

/**
 * Defines context store for saving access tokens and app configuration in DynamoDB.
 */
const contextStore = new DynamoDBContextStore({
	table: {
		name: process.env.DYNAMODB_TABLE_NAME,
		hashKey: 'pk',
		sortKey: 'sk'
	},
	autoCreate: false
});

/**
 * Defines the SmartApp
 */
module.exports = new SmartApp()

	// Configure the use of the i18n framework to SmartApp configuration page text. If you set
	// update: true the locale file will automatically be created, after which you can edit it.
	.configureI18n({updateFiles: true})

	// These three values come from the app record, and is available from the dev workspace
	.appId(process.env.ST_APP_ID)
	.clientId(process.env.ST_CLIENT_ID)
	.clientSecret(process.env.ST_CLIENT_SECRET)
	.permissions(['i:deviceprofiles:*', 'x:scenes:*'])

	// Logs lifecycle events and responses for debug purposes
	.enableEventLogging()

	// Configure the context store for you app.
	// By configuring a context store you allow the SmartApp SDK to manage the storable and retrieval
	// of access tokens and configuration options, for use when you make pro-active callbacks to the
	// SmartThings API. For example, when you tap switches on the dashboard of this example app
	.contextStore(contextStore)

	// Hide the field that allows the app to be renamed. It isn't necessary since this app automatically
	// generates unique names from users' Zoom email addresses
	.disableCustomDisplayName()

	// Define the SmartApp configuration page.
	.page('mainPage', pageHandlers.mainPage)

	// Handler called whenever app is installed or updated
	// Called for both INSTALLED and UPDATED lifecycle events if there is
	// no separate installed() handler
	.updated(updatedHandler)

	// Handler called when an app is uninstalled from an account. You should do any cleanup your system might
	// require here.
	.uninstalled(uninstalledHandler)

	// Handler called after SmartThings receives the redirect from the OAuth login page.
	.oauthHandler(oauthHandler)
