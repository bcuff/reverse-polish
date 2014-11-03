/*jslint indent: 2, regexp: true */
'use strict';

var readline = require('readline'),
  EventEmitter = require('events').EventEmitter,
  util = require('util');

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
  },
  'tan': function (value) {
    return Math.tan(value);
  },
  'cos': function (value) {
    return Math.cos(value);
  },
  'sin': function (value) {
    return Math.sin(value);
  }
};

function Calculator(options) {
  EventEmitter.call(this);
  var self = this,
    stack = [],
    output = options.output,
    input = options.input,
    error = options.error,
    rl = readline.createInterface({
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
    var op,
      result,
      i;
    if (!operators.hasOwnProperty(symbol)) {
      error.write('unknown operator "' + symbol + '"\n');
      return;
    }
    op = operators[symbol];
    if (stack.length < op.length) {
      error.write('too few arguments to operator "' + symbol + '"\n');
      return;
    }
    var args = [];
    for(i = 0; i < op.length; ++i) {
      args.unshift(stack.pop());
    }
    try {
      result = op.apply(null, args);
      stack.push(result);
      return result;
    } catch (e) {
      error.write(e.message + '\n');
    }
  }

  function executeToken(token) {
    var number = parseFloat(token);
    if (!isNaN(number) && isFinite(token)) {
      stack.push(number);
      return number;
    }
    if (token === 'q') {
      rl.close();
      return;
    }
    return executeOperator(token);
  }

  rl.on('line', function (line) {
    var tokens = line.trim().match(/[^\s,]+/g),
      result;
    tokens.forEach(function (token) {
      result = executeToken(token);
    });
    if (typeof result !== 'undefined') {
      output.write(result + '\n');
    }
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
