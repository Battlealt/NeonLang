class Environment {
    constructor(env, par) {
        this.record = env;
        this.parent = par;
    }

    create(name, value) {
        this.record[name] = value;
        return value;
    }

    assign(name, value) {
        this.resolve(name).record[name] = value;
        return value;
    }

    lookup(name) {
        return this.resolve(name).record[name];
    }

    resolve(name) {
        if (this.record.hasOwnProperty(name)) return this.record;
        if (this.parent == null) throw new ReferenceError(`Could not resolve variable '${name}'`);
        if (this.parent.hasOwnProperty(name)) return this.parent;

        return this.parent.resolve(name);
    }
}

module.exports = Environment;