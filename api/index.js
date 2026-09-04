const app = require('../backend/src/index');

module.exports = (req, res) => {
  return app(req, res);
};
