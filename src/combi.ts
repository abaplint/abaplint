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

class Word implements IRunnable {

    constructor(private s: String) { }

    public run(r: Array<Result>): Array<Result> {
        let result: Array<Result> = [];

        for (let input of r) {
            if (input.length() !== 0 && input.peek().get_str() === this.s) {
                result.push(input.shift());
            }
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
            }

            for (let foo of temp) {
                result.push(foo);
            }
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

                for (let foo of temp) {
                    result.push(foo);
                }
            }
        }

        return result;
    }
}

export class Combi {
    public static run(runnable: IRunnable, tokens: Array<Tokens.Token>): boolean {
        let input = new Result(tokens);

        let result = runnable.run([input]);
        let success = false;
        for (let res of result) {
            if (res.length() === 0) {
                success = true;
            }
        }

        return success;
    }
}

export function str(s: String): IRunnable {
    return new Word(s);
}
export function seq(first: IRunnable, ...rest: IRunnable[]): IRunnable {
    return new Sequence([first].concat(rest));
}
export function alt(first: IRunnable, ...rest: IRunnable[]): IRunnable {
    return new Alternative([first].concat(rest));
}
export function token(s: string): Tokens.Token {
    return new Tokens.Identifier(10, 10, s);
}