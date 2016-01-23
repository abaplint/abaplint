import * as Tokens from "./tokens/tokens";

class Result {
    private tokens: Array<Tokens.Token>;

    constructor(a: Array<Tokens.Token>) {
        this.tokens = a;
    }

    public peek(): Tokens.Token {
        return this.tokens[0];
    }

    public shift(): Result {
        let copy = this.tokens.slice();
        copy.shift();
        return new Result(copy);
    }

    public length(): number {
        return this.tokens.length;
    }
}

interface IRunnable {
    run(r: Array<Result>): Array<Result>;
}

class Anything implements IRunnable {
    public run(r: Array<Result>): Array<Result> {
        let result: Array<Result> = [];
        for (let input of r) {
            let length = input.length();
            for (let i = 0; i <= length; i++) {
                result.push(input);
                input = input.shift();
            }
        }
        return result;
    }
}

class Nothing implements IRunnable {
    public run(r: Array<Result>): Array<Result> {
        return [];
    }
}

class Regex implements IRunnable {

    private regexp: RegExp;

    constructor(r: RegExp) {
        this.regexp = r;
    }

    public run(r: Array<Result>): Array<Result> {
        let result: Array<Result> = [];

        for (let input of r) {
            if (input.length() !== 0
                    && this.regexp.test(input.peek().get_str()) === true) {
                result.push(input.shift());
            }
        }

        return result;
    }
}

class Word implements IRunnable {

    constructor(private s: String) { }

    public run(r: Array<Result>): Array<Result> {
        let result: Array<Result> = [];

        for (let input of r) {
            if (input.length() !== 0
                    && input.peek().get_str().toUpperCase() === this.s.toUpperCase()) {
                result.push(input.shift());
            }
        }
        return result;
    }
}

class Optional implements IRunnable {

    constructor(private opt: IRunnable) { }

    public run(r: Array<Result>): Array<Result> {
        let result: Array<Result> = [];

        for (let input of r) {
            result.push(input);
            let res = this.opt.run([input]);
            result = result.concat(res);
        }

        return result;
    }
}

class Star implements IRunnable {

    constructor(private star: IRunnable) { }

    public run(r: Array<Result>): Array<Result> {
        let result = r;

        let res = r;
        let input: Array<Result> = [];
        while (true) {
            input = res;
            res = this.star.run(input);

            if (res.length === 0) {
                break;
            }

            result = result.concat(res);
        }

        return result;
    }
}

class Sequence implements IRunnable {
    private list: Array<IRunnable>;

    constructor(list: IRunnable[]) {
        if (list.length < 2) {
            console.log("Sequence, length error");
        }
        this.list = list;
    }

    public run(r: Array<Result>): Array<Result> {
        let result: Array<Result> = [];

        for (let input of r) {
            let temp = [input];
            for (let seq of this.list) {
                temp = seq.run(temp);
                if (temp.length === 0) {
                    break;
                }
            }

            result = result.concat(temp);
        }

        return result;
    }
}

class Alternative implements IRunnable {
    private list: Array<IRunnable>;

    constructor(list: IRunnable[]) {
        if (list.length < 2) {
            console.log("Alternative, length error");
        }
        this.list = list;
    }

    public run(r: Array<Result>): Array<Result> {
        let result: Array<Result> = [];

        for (let input of r) {

            for (let seq of this.list) {
                let temp = seq.run([input]);

                result = result.concat(temp);
            }
        }

        return result;
    }
}

export class Combi {
    public static run(runnable: IRunnable, tokens: Array<Tokens.Token>, remove = false): boolean {
        let copy = tokens.slice();
        if (remove === true) {
            copy.pop();
        }

        copy = copy.filter(function (value) { return !(value instanceof Tokens.Pragma); } );

        let input = new Result(copy);

        let result = runnable.run([input]);
        let success = false;
        for (let res of result) {
            if (res.length() === 0) {
                success = true;
                break;
            }
        }

        return success;
    }
}

export function anything(): IRunnable {
    return new Anything();
}
export function nothing(): IRunnable {
    return new Nothing();
}
export function str(s: String): IRunnable {
    let split = s.split(" ");

    if (split.length === 1) {
        return new Word(s);
    }

    let words: Array<IRunnable> = [];
    for (let str of split) {
        words.push(new Word(str));
    }
    return new Sequence(words);
}
export function seq(first: IRunnable, ...rest: IRunnable[]): IRunnable {
    return new Sequence([first].concat(rest));
}
export function alt(first: IRunnable, ...rest: IRunnable[]): IRunnable {
    return new Alternative([first].concat(rest));
}
export function opt(first: IRunnable): IRunnable {
    return new Optional(first);
}
export function star(first: IRunnable): IRunnable {
    return new Star(first);
}
export function regex(r: RegExp): IRunnable {
    return new Regex(r);
}