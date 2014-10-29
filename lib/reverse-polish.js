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
    if(right === 0) {
      throw new Error('division by zero is not allowed');
    }
    return left / right;
  }
}

var Calculator = function (options) {
  EventEmitter.call(this);
  var self = this;
  var stack = [];
  var output = options.output;
  var input = options.input;
  var error = options.error || output;
  var rl = readline.createInterface({
    input: options.input,
    output: options.output
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
    } catch(e) {
      error.write(e.message + '\n');
    }
  }

  rl.on('line', function (line) {
    line = line.trim();
    var number = parseFloat(line);
    if (!isNaN(number) && isFinite(number)) {
      stack.push(number);
      output.write(number.toString() + '\n');
    } else if (line === 'q') {
      rl.close();
    } else {
      executeOperator(line);
    }
    rl.prompt();
  });

  this.start = function () {
    rl.prompt();
  }
}
util.inherits(Calculator, EventEmitter);

module.exports = function (options) {
  return new Calculator(options);
}
