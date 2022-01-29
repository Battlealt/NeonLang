const StringHandle = require('./escapes');

module.exports = class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.next = this.tokens.nextToken();

        return this.program();
    }

    stringStatement() {
        let s = this.next;
        this.advance('STRING');
        s = {
            type: 'STRING',
            value: StringHandle(s.value.slice(1, -1))
        };
        return s;
    }

    numberStatement() {
        let r = this.next;
        r.value = Number(r?.value);
        this.advance('NUMBER');
        return r;
    }

    unary() {
        let op, num;

        if (this.next?.type === 'OPERATOR' && this.tokens.isAdditive(this.next.value)) {
            op = this.next.value;
            this.advance('OPERATOR');
            num = this.statement();
        }

        if (op != null) return {
            type: 'UNARY',
            operator: op,
            value: num,
        }

        return this.primaryStatement();
    }

    exponentExpression() {
        return this.binaryExpression('unary', 'isPower');
    }

    multiplicationExpression() {
        return this.binaryExpression('exponentExpression', 'isMultiplicative');
    }
    
    additionExpression() {
        return this.binaryExpression();
    }

    binaryExpression(par='multiplicationExpression', test='isAdditive') {
        let left = this[par]();

        while (this.next?.type === 'OPERATOR' && this.tokens[test](this.next.value)) {
            let op = this.next.value;
            this.advance('OPERATOR');
            let right = this[par]();

            left = {
                type: 'BINARY',
                operator: op,
                left,
                right,
            }
        }

        return left;
    }

    blockStatement() {
        this.advance('LBLOCK', '{');
        const body = this.statementList('RBLOCK');
        this.advance('RBLOCK', '}');
        return {
            type: 'BLOCK',
            body,
        }
    }

    parenthesizedExpression() {
        this.advance('LPAREN');
        const body = this.statement();
        this.advance('RPAREN');
        return body;
    }

    primaryStatement() {
        switch (this.next?.type) {
            case 'EXPR_END':
                this.advance('EXPR_END');
                return { type: 'EMPTY' };
            case 'NUMBER':
                return this.numberStatement();
            case 'STRING':
                return this.stringStatement();
            case 'LBLOCK':
                return this.blockStatement();
            case 'LPAREN':
                return this.parenthesizedExpression();
            case 'OPERATOR':
                return this.unary();
            default:
                const r = this.next;
                this.advance();
                return r;
        }
    }

    statement() {
        return this.additionExpression();
        // switch (this.next?.type) {
        //     case 'NUMBER':
                
        //     case 'OPERATOR':
        //         return this.unary();
        //     default:
        //         return this.primaryStatement();
        // }
    }

    statementList(endOn) {
        let res = [];

        while (this.next != null && this.next.type != endOn) {
            res.push(this.statement());
            if (this.next?.type === 'EXPR_END') this.advance('EXPR_END', ';');
        }

        return res;
    }

    program() {
        return {
            type: 'PROGRAM',
            body: this.statementList()
        };
    }

    advance(type, lk) {
        lk = lk ?? type;
        if (type != null) {
            if (this.next == null) throw new SyntaxError(`Input abruptly ended while expecting '${lk}'`);
            if (this.next.type !== type) throw new SyntaxError(`Unexpected token '${this.next.value}': Expected '${lk}'`);
        }

        this.next = this.tokens.nextToken();
        return this.next;
    }
}