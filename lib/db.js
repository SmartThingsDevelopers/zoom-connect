'use strict'

const AWS = require('aws-sdk');
const awsRegion = process.env.AWS_REGION || 'us-east-1'
const dynamoTableName = process.env.DYNAMODB_TABLE_NAME
AWS.config.update({ region: awsRegion });
const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

/**
 * Defines methods for storing and retrieving Zoom user information. Uses the same DynamoDB table used for
 * the SmartApp context store for these records. This information is necessary in order to determine which
 * installedApp instance should be called when a web-hook call from Zoom is received.
 */
const db = {

	/**
	 * Associates a zoom user with an installed app instance
	 * @param user the Zoom user record
	 * @param installedAppId the installed app ID
	 * @returns {Promise<PromiseResult<DocumentClient.PutItemOutput, AWSError>>}
	 */
	putZoomUser(user, installedAppId) {
		const params = {
			TableName: dynamoTableName,
			Item: {
				pk: `user:${user.id.toLowerCase()}`, // TODO lower case because of Zoom bug https://devforum.zoom.us/t/user-id-downcased-in-user-presence-status-updated/42228/4
				sk: installedAppId,
				gsi1: installedAppId,
				email: user.email,
				id: user.id
			}
		};

		return docClient.put(params).promise()
	},

	/**
	 * Returns the list of installed app IDs associated with the Zoom username. There can be
	 * more than one because the app could be installed in multiple ST locations or accounts.
	 * @param userId the Zoom user ID
	 * @returns {Promise<string[]>}
	 */
	getInstalledAppIds(userId) {
		const params = {
			TableName: dynamoTableName,
			KeyConditionExpression: "pk = :pk",
			ExpressionAttributeValues: {
				":pk": `user:${userId.toLowerCase()}` // TODO lower case because of Zoom bug https://devforum.zoom.us/t/user-id-downcased-in-user-presence-status-updated/42228/4
			}
		};

		return docClient.query(params).promise().then(data => {
			return data.Items.map(it => it.sk)
		}).catch(reason => {
			console.error(`Error in getInstalledAppIds(${userId})`, reason)
			return []
		})
	},

	/**
	 * Returns the Zoom username (email address) associated with the installed app
	 * @param installedAppId the installed app ID
	 * @returns {Promise<any | undefined>}
	 */
	getZoomUser(installedAppId) {
		const params = {
			TableName: dynamoTableName,
			IndexName: "gsi1-index",
			KeyConditionExpression: "gsi1 = :installedAppId",
			ExpressionAttributeValues: {
				":installedAppId": installedAppId
			}
		}

		return docClient.query(params).promise().then(data => {
			return data.Items ? data.Items[0] : undefined
		}).catch(reason => {
			console.error(`Error in getZoomUser(${installedAppId})`, reason)
			return undefined
		})
	},

	/**
	 * Removes the association between a Zoom user and installed app instance
	 * @param installedAppId the installed app ID
	 * @returns {Promise<PromiseResult<DocumentClient.DeleteItemOutput, AWSError>>}
	 */
	async deleteZoomUser(installedAppId) {
		const user = await this.getZoomUser(installedAppId)
		if (user) {
			return docClient.delete({
				TableName: dynamoTableName,
				Key: {
					pk: user.pk,
					sk: installedAppId
				}
			}).promise()
		}
	}
}

module.exports = db;
