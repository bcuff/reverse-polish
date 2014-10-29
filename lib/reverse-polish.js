'use strict';

var readline = require('readline');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var operators = {
  '+': function (left, right) {
    return left + right;
  },
  '-': function (left, right) {
    return left - right;
  },
  '*': function (left, right) {
    return left * right;
  },
  '/': function (left, right) {
    if (right === 0) {
      throw new Error('division by zero is not allowed');
    }
    return left / right;
  }
};

function Calculator(options) {
  EventEmitter.call(this);
  var self = this;
  var stack = [];
  var output = options.output;
  var input = options.input;
  var error = options.error || output;
  var rl = readline.createInterface({
    input: input,
    output: output
  });

  if (typeof options.prompt === 'string') {
    rl.setPrompt(options.prompt, 2);
  } else {
    rl.setPrompt('> ', 2);
  }

  rl.on('close', function () {
    self.emit('close');
  });

  function executeOperator(symbol) {
    if (!operators.hasOwnProperty(symbol)) {
      error.write('unknown operator "' + symbol + '"\n');
      return;
    }
    if (stack.length < 2) {
      error.write('too few arguments to operator "' + symbol + '"\n');
      return;
    }
    var op = operators[symbol];
    var right = stack.pop();
    var left = stack.pop();
    try {
      var result = op(left, right);
      stack.push(result);
      output.write(result.toString() + '\n');
    } catch (e) {
      error.write(e.message + '\n');
    }
  }

  function onToken(token) {
    var number = parseFloat(token);
    if (!isNaN(number) && isFinite(token)) {
      stack.push(number);
      output.write(number.toString() + '\n');
    } else if (token === 'q') {
      rl.close();
    } else {
      executeOperator(token);
    }
  }

  rl.on('line', function (line) {
    line = line.trim();
    var tokens = line.match(/[^\s,]+/g);
    tokens.forEach(onToken);
    rl.prompt();
  });

  this.start = function () {
    rl.prompt();
  };
}
util.inherits(Calculator, EventEmitter);

module.exports = function (options) {
  return new Calculator(options);
};
