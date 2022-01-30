const Environment = require('./environment');

class Interpreter {
    eval(exp, env=GlobalEnvironment) {
        const isTypeof = t => exp?.type?.toLowerCase() === t.toLowerCase();

        if (this._isNumber(exp)) return exp;

        // Type related stuff:
        if (isTypeof('NUMBER')) {
            return exp?.value;
        }
        if (isTypeof('STRING')) {
            return exp?.value;
        }

        // Math related stuff:
        if (isTypeof('BINARY')) {
            return this.handleBinaryExpression(exp, env);
        }

        if (isTypeof('UNARY')) {
            return Number(exp?.operator + this.eval(exp?.value, env));
        }

        // Variable related stuff:
        if (isTypeof('IDENTIFIER')) {
            return env.lookup(exp?.value);
        }
        
        if (isTypeof('DEFINE')) {
            return env.define(exp?.name?.value, this.eval(exp?.value, env));
        }

        // ------------------------
        // Functions

        // Function call
        if (isTypeof('FUNCTION_CALL')) {
            let func = env.lookup(exp?.name?.value);
            
            // Native functions
            if (typeof func === 'function') {
                return func(...exp?.arguments.map(val=>this.eval(val, env)));
            }

            // User functions
            let args = {};
            for (let pos in func.arguments) {
                if (func.arguments[pos].type !== 'IDENTIFIER') throw new TypeError(`Expected all arguments to be identifiers in function call to '${exp?.name?.value}'`);
                args[func.arguments[pos].value] = this.eval(exp?.arguments[pos], env);
            }

            let funcEnv = new Environment(args, env);
            return this.evalLoop(func.body, funcEnv);
        }

        // Function definition
        if (isTypeof('FUNCTION_DEFINITION')) {
            const fname = exp?.name?.value;
            const args = exp?.arguments;
            const body = exp?.body;

            let func = {
                arguments: args,
                body,
            }
            
            env.define(fname, func);
            return func;
        }

        // Block
        if (isTypeof('BLOCK')) {
            return this.evalBlock(exp?.body, env);
        }
        if (isTypeof('PROGRAM')) {
            let res;
            exp.body.forEach(item=>{
                res = this.eval(item, env);
            });
            return res;
        }

        // Unknown
        throw new Error(`Unknown execution: ${exp}`);
    }

    evalLoop(block, env) {
        let res;
        block.body.forEach(item=>{
            res = this.eval(item, env);
        });
        return res;
    }

    evalBlock(blk, env) {
        const blockEnv = new Environment({}, env);
        return this.evalLoop(blk, blockEnv);
    }

    handleBinaryExpression(exp, env) {
        let left = this.eval(exp?.left, env);
        let right = this.eval(exp?.right, env);

        switch (exp?.operator) {
            case '+':
                return left + right;
            case '*':
                return left * right;
            case '-':
                return left - right;
            case '/':
                return left / right;
            case '^':
                return left ** right;
        }
    }

    _isNumber(exp) {
        return typeof exp === 'number';
    }
}

const GlobalEnvironment = new Environment({
    VER: '1.0.0',
    OS: process.platform,
    
    // Native functions
    print(...args) { console.log(...args); return args.join(" "); },
});

module.exports = Interpreter;