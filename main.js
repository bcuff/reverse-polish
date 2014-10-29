var reversePolish = require('./lib/reverse-polish');
reversePolish({
  input: process.stdin,
  output: process.stdout,
  error: process.stderr
})
.on('close', function () {
  process.exit(0);
})
.start();