const coffee = require('coffee-script');

module.exports = function compile(text) {
  return coffee.compile(text);
}
