const testCode = `
ads = 32+32
`; // 1+1-3

const Lexer = require('./lexer');
const tokens = new Lexer(testCode);

const Parser = require('./parser');
const ast = new Parser(tokens);

console.log(JSON.stringify(ast, null, 4));