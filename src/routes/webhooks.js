/**
 * Created by Drew Lemmy, 2016
 *
 * This file is part of Krist.
 *
 * Krist is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Krist is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Krist. If not, see <http://www.gnu.org/licenses/>.
 *
 * For more project information, see <https://github.com/Lemmmy/Krist>.
 */

var krist               = require('./../krist.js'),
	utils               = require('./../utils.js'),
	webhooks            = require('./../webhooks.js'),
	webhooksController  = require('./../controllers/webhooks.js');

module.exports = function(app) {
	/**
	 * @apiDefine WebhookGroup Webhooks
	 *
	 * All Webhook related endpoints.
	 *
	 * ## Event Types
	 *
	 * * `transaction` - A transaction event; called whenever somebody in the address list (or anybody if
	 * 				   the address list is unspecified) makes a transaction.
	 *
	 * * `block` - A block event; called whenever somebody submits and solves a block.
	 *
	 * * `name` - A name event; called whenever somebody in the address list (or anybody if
	 * 			the address list is unspecified) pu
	 * 			rchases a name.
	 *
	 * ## Validation
	 *
	 * When a webhook makes a request to your server, it will additionally supply a 'token' argument via the data. You
	 * may use this to verify that the requests are actually coming from the server. The token is generated per-webhook
	 * and can be retrieved when creating the webhook or when getting your webhook listing.
	 */

	/**
	 * @apiDefine Webhook
	 *
	 * @apiSuccess {Object} webhook
	 * @apiSuccess {Number} webhook.id The ID of this webhook.
	 * @apiSuccess {String="transaction","block","name"} webhook.event The event type of this webhook.
	 * @apiSuccess {String} webhook.url The URL this webhook calls.
	 * @apiSuccess {String} webhook.owner The address that owns this webhook.
	 * @apiSuccess {String} webhook.token The validation token of this webhook.
	 * @apiSuccess {String[]} [webhook.addresses] The list of addresses whitelisted for this event. Can be null. Only
	 * 			   appears if the webhook event type is `transaction` or `name`.
	 * @apiSuccess {String="get","post"} [webhook.method] The HTTP method this webhook will be called with.
	 */

	/**
	 * @apiDefine Webhooks
	 *
	 * @apiSuccess {Object[]} webhooks
	 * @apiSuccess {Number} webhooks.id The ID of this webhook.
	 * @apiSuccess {String="transaction","block","name"} webhooks.event The event type of this webhook.
	 * @apiSuccess {String} webhooks.url The URL this webhook calls.
	 * @apiSuccess {String} webhooks.owner The address that owns this webhook.
	 * @apiSuccess {String} webhooks.token The validation token of this webhook.
	 * @apiSuccess {String[]} [webhooks.addresses] The list of addresses whitelisted for this event. Can be null. Only
	 * 			   appears if the webhook event type is `transaction` or `name`.
	 * @apiSuccess {String="get","post"} [webhooks.method] The HTTP method this webhook will be called with.
	 */

	/**
	 * @api {post} /webhooks Make a webhook
	 * @apiName MakeWebhook
	 * @apiGroup WebhookGroup
	 * @apiVersion 2.0.0
	 *
	 * @apiParam (BodyParameter) {String} privatekey The privatekey of your address.
	 * @apiParam (BodyParameter) {String} owner Your address, used as confirmation.
	 * @apiParam (BodyParameter) {String="transaction","block","name"} event The event type of this webhook.
	 * @apiParam (BodyParameter) {String} url The URL to call for this webhook.
	 * @apiParam (BodyParameter) {String="get","post"} [method] The HTTP method to call for this webhook.
	 * @apiParam (BodyParameter) {String} [addresses] A comma delimited list of addresses to whitelist for this event.
	 * 			 Only valid for `transaction` or `name` events.
	 *
	 * @apiUse Webhook
	 * @apiSuccess {Object} webhook The newly created webhook.
	 *
	 * @apiSuccessExample {json} Success
	 * {
     *     "ok": true,
     *     "webhook": {
     *         "id": 15,
     *         "event": "transaction",
     *         "addresses": null,
     *         "url": "https://denabot.pw/coinstest.php",
     *         "method": "get",
     *         "owner": "cxxhsp1uzh"
     *     }
     * }
     *
	 * @apiErrorExample {json} Auth Failed
	 * {
	 *     "ok": false,
	 *     "error": "auth_failed"
	 * }
	 */
	app.post('/webhooks', function(req, res) {
		webhooksController.registerWebhook(req.body.privatekey, req.body.owner, req.body.event, req.body.url, req.body.method, req.body.addresses).then(function(webhook) {
			res.json({
				ok: true,
				webhook: webhooksController.webhookToJSON(webhook)
			});
		}).catch(function(error) {
			utils.sendErrorToRes(req, res, error);
		});
	});

	function getWebhooksByOwner(req, res) {
		webhooksController.getWebhooksByAddress(req.body.privatekey, req.params.owner).then(function(results) {
			var out = [];

			results.forEach(function(webhook) {
				out.push(webhooksController.webhookToJSON(webhook));
			});

			res.json({
				ok: true,
				count: out.length,
				webhooks: out
			});
		}).catch(function(error) {
			utils.sendErrorToRes(req, res, error);
		});
	}

	/**
	 * @api {post} /webhooks/:owner Get all webhooks registered to an address
	 * @apiName GetWebhooks
	 * @apiGroup WebhookGroup
	 * @apiVersion 2.0.0
	 *
	 * @apiDescription This request is POST because webhooks are only viewable by their owner. The privatekey is passed
	 * 			       through the request body.
	 *
	 * @apiParam (URLParameter) {String} address The address.
	 * @apiParam (BodyParameter) {String} privatekey The privatekey of the address.
	 *
	 * @apiSuccess {Number} count The count of results.
	 * @apiUse Webhooks
	 *
	 * @apiSuccessExample {json} Success
	 * {
     *     "ok": true,
     *     "count": 4,
     *     "webhooks": [
     *         {
     *             "id": 1,
     *             "event": "name",
     *             "addresses": null,
     *             "url": "https://denabot.pw/coinstest.php",
     *             "method": "get",
     *             "owner": "cxxhsp1uzh"
     *         },
     *         ...
     *
     * @apiErrorExample {json} Auth Failed
	 * {
	 *     "ok": false,
	 *     "error": "auth_failed"
	 * }
	 *
	 * @apiErrorExample {json} Address Not Found
	 * {
	 *     "ok": false,
	 *     "error": "address_not_found"
	 * }
	 *
	 * @apiErrorExample {json} Invalid Address
	 * {
	 *     "ok": false,
	 *     "error": "invalid_parameter",
	 *     "parameter": "address"
	 * }
	 */
	app.post('/webhooks/:owner', getWebhooksByOwner);

	/**
	 * @api {post} /addresses/:address/webhooks Get all webhooks registered to an address
	 * @apiName GetAddressWebhooks
	 * @apiGroup AddressGroup
	 * @apiVersion 2.0.0
	 *
	 * @apiDescription This request is POST because webhooks are only viewable by their owner. The privatekey is passed
	 * 			       through the request body.
	 *
	 * @apiParam (URLParameter) {String} address The address.
	 * @apiParam (BodyParameter) {String} privatekey The privatekey of the address.
	 *
	 * @apiSuccess {Number} count The count of results.
	 * @apiUse Webhooks
	 *
	 * @apiSuccessExample {json} Success
	 * {
     *     "ok": true,
     *     "count": 4,
     *     "webhooks": [
     *         {
     *             "id": 1,
     *             "event": "name",
     *             "addresses": null,
     *             "url": "https://denabot.pw.pw/coinstest.php",
     *             "method": "get",
     *             "owner": "cxxhsp1uzh"
     *         },
     *         ...
	 *
	 * @apiErrorExample {json} Address Not Found
	 * {
	 *     "ok": false,
	 *     "error": "address_not_found"
	 * }
	 *
	 * @apiErrorExample {json} Invalid Address
	 * {
	 *     "ok": false,
	 *     "error": "invalid_parameter",
	 *     "parameter": "address"
	 * }
	 */
	app.post('/address/:owner/webhooks', getWebhooksByOwner);

	function deleteWebhook(req, res) {
		webhooksController.deleteWebhook(req.body.privatekey, req.body.owner, req.params.id).then(function() {
			res.json({
				ok: true
			});
		}).catch(function(error) {
			utils.sendErrorToRes(req, res, error);
		});
	}

	/**
	 * @api {post} /webhooks/:id/delete Delete a webhook (POST)
	 * @apiName DeleteWebhookPOST
	 * @apiGroup WebhookGroup
	 * @apiVersion 2.0.0
	 *
	 * @apiParam (URLParameter) {String} id The ID of the webhook to delete.
	 * @apiParam (BodyParameter) {String} privatekey The privatekey of the address which owns the webhook.
	 * @apiParam (BodyParameter) {String} owner The address which owns the webhook. Used as confirmation.
	 *
	 * @apiSuccessExample {json} Success
	 * {
     *     "ok": true,
     * }
     *
	 * @apiErrorExample {json} Auth Failed
	 * {
	 *     "ok": false,
	 *     "error": "auth_failed"
	 * }
	 *
	 * @apiErrorExample {json} Webhook Not Found
	 * {
	 *     "ok": false,
	 *     "error": "webhook_not_found"
	 * }
	 */
	app.post('/webhooks/:id/delete', deleteWebhook)

	/**
	 * @api {delete} /webhooks/:id Delete a webhook (DELETE)
	 * @apiName DeleteWebhookDELETE
	 * @apiGroup WebhookGroup
	 * @apiVersion 2.0.0
	 *
	 * @apiParam (URLParameter) {String} id The ID of the webhook to delete.
	 * @apiParam (BodyParameter) {String} privatekey The privatekey of the address which owns the webhook.
	 * @apiParam (BodyParameter) {String} owner The address which owns the webhook. Used as confirmation.
	 *
	 * @apiSuccessExample {json} Success
	 * {
     *     "ok": true,
     * }
	 *
	 * @apiErrorExample {json} Auth Failed
	 * {
	 *     "ok": false,
	 *     "error": "auth_failed"
	 * }
	 *
	 * @apiErrorExample {json} Webhook Not Found
	 * {
	 *     "ok": false,
	 *     "error": "webhook_not_found"
	 * }
	 */
	app.delete('/webhooks/:id', deleteWebhook);

	return app;
};
