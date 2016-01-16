var utils = require('./../../src/utils.js')

module.exports = function(app) {
	app.get('/', function(req, res, next) {
		if (req.query.v2) {
			res.send(utils.makeV2Address(req.query.v2));
			return;
		}

		next();
	});

	app.get('/v2/:key', function(req, res) {
		res.header('Content-Type', 'application/json');

		res.json({
			ok: true,
			address: utils.makeV2Address(req.params.key)
		});
	});

	return app;
}