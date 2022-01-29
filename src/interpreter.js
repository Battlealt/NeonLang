const Environment = require('./environment');

class Interpreter {
    eval(exp, env=GlobalEnvironment) {
        const isTypeof = t => exp?.type?.toLowerCase() === t.toLowerCase();

        if (this._isString(exp)) return exp;
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
            return this.handleBinaryExpression(exp);
        }

        if (isTypeof('UNARY')) {
            return Number(exp?.operator + this.eval(exp?.value));
        }

        // Variable related stuff:
        if (isTypeof('IDENTIFIER')) {
            return env.lookup(exp?.value);
        }
        
        if (isTypeof('DEFINE')) {
            return env.define(exp?.name?.value, this.eval(exp?.value));
        }

        // Functions
        if (isTypeof('FUNCTION_CALL')) {
            let func = env.lookup(exp?.name?.value);
            
            // Native functions
            if (typeof func === 'function') {
                return func(...exp?.arguments.map(val=>this.eval(val)));
            }

            // User functions
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

    evalBlock(blk, env) {
        let res;
        const blockEnv = new Environment({}, env);
        blk.body.forEach(item=>{
            res = this.eval(item, blockEnv);
        });
        return res;
    }

    handleBinaryExpression(exp) {
        let left = this.eval(exp?.left);
        let right = this.eval(exp?.right);

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
    _isString(exp) {
        return typeof exp === 'string' && ((exp[0] === '"' && exp.slice(-1) === '"') || (exp[0] === "'" && exp.slice(-1) === "'"));
    }
    _isIdentifier(exp) {
        return /^[a-zA-Z_]\w*$/.exec(exp) != null;
    }
}

const GlobalEnvironment = new Environment({
    VER: '1.0.0',
    OS: process.platform,
    
    // Native functions
    print(txt) { console.log(txt); return txt; },
});

module.exports = Interpreter;