/*jslint indent: 2 */
'use strict';

var reversePolish = require('../lib/reverse-polish'),
  MemoryStream = require('memorystream'),
  util = require('util');

function toConsoleFormat(values) {
  if (util.isArray(values)) {
    return values.join('\n') + '\n';
  }
  return values;
}

function assertInput(options, done) {
  var test = options.test,
    input = new MemoryStream(),
    output = new MemoryStream(),
    error = new MemoryStream(),
    outputText = '',
    errorText = '',
    calculator = reversePolish({
      input: input,
      output: output,
      error: error,
      prompt: ''
    });
  options.input = toConsoleFormat(options.input);
  options.output = toConsoleFormat(options.output);
  options.error = toConsoleFormat(options.error);

  output.on('data', function (chunk) { outputText += chunk; });
  error.on('data', function (chunk) { errorText += chunk; });
  calculator.on('close', function () {
    test.equal(outputText, options.output);
    test.equal(errorText, options.error);
    done();
  });

  calculator.start();
  input.end(options.input);
}

exports.add = function (test) {
  assertInput({
    input:  [ 3, 5, '+', -2, '+' ],
    output: [ 3, 5, 8,   -2, 6   ],
    error: '',
    test: test
  }, test.done);
};

exports.subtract = function (test) {
  assertInput({
    input:  [ 4, 2, '-', 2, '-' ],
    output: [ 4, 2, 2,   2, 0   ],
    error: '',
    test: test
  }, test.done);
};

exports.multiply = function (test) {
  assertInput({
    input:  [ 4, 2, '*', 0.5, '*' ],
    output: [ 4, 2, 8,   0.5, 4   ],
    error: '',
    test: test
  }, test.done);
};


exports.divide = function (test) {
  assertInput({
    input:  [ 4, 2, '/', 2, '/' ],
    output: [ 4, 2, 2,   2, 1   ],
    error: '',
    test: test
  }, test.done);
};

exports['single line input'] = function (test) {
  assertInput({
    input: '4 2 / 2 /,5,*\n',
    output: [ 5 ],
    error: '',
    test: test
  }, test.done);
};

exports['divide by zero'] = function (test) {
  assertInput({
    input:  [ 1, 0, '/' ],
    output: [ 1, 0 ],
    error: 'division by zero is not allowed\n',
    test: test
  }, test.done);
};

exports['too few arguments'] = function (test) {
  assertInput({
    input:  [ 1, '+' ],
    output: [ 1 ],
    error: 'too few arguments to operator "+"\n',
    test: test
  }, test.done);
};

exports['unknown operator'] = function (test) {
  assertInput({
    input:  [ 1, 2, '?' ],
    output: [ 1, 2 ],
    error: 'unknown operator "?"\n',
    test: test
  }, test.done);
};

exports.quit = function (test) {
  assertInput({
    input: [ 'q' ],
    output: '',
    error: '',
    test: test
  }, test.done);
};
