import * as Tokens from "./tokens/tokens";

// empty = no matches
// null?

class Result {
    private tokens: Array<Tokens.Token>;

    public setInput(a: Array<Tokens.Token>) {
        this.tokens = a;
    }

    public peek(): Tokens.Token {
        return this.tokens[0];
    }

    public shift(): Result {
        this.tokens.shift();
        return this;
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

        for(let input of r) {
            if(input.peek().get_str() == this.s) {
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
            console.log("Seq, length error");
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

            for(let foo of temp) {
                result.push(foo);
            }
        }

        return result;
    }
}

class Combi {
    public static run(runnable: IRunnable, tokens: Array<Tokens.Token>) {
        let input = new Result();
        input.setInput(tokens);

        let result = runnable.run([input]);
        let success: boolean = false;
        for (let res of result) {
            if (res.length() === 0) {
                success = true;
            }
        }

        if (success === true) {
            console.log("success");
        } else {
            console.log("nope");
        }
    }
}

function str(s: String): IRunnable {
    return new Word(s);
}
function seq(first: IRunnable, ...rest: IRunnable[]): IRunnable {
    return new Sequence([first].concat(rest));
}
function token(s: string): Tokens.Token {
    return new Tokens.Identifier(10, 10, s);
}

let foo = str("foo");
let tokens = [token("foo")];
console.log("test 1:");
Combi.run(foo, tokens);

foo = seq(str("foo"), str("bar"));
tokens = [token("foo"), token("bar")];
console.log("test 2:");
Combi.run(foo, tokens);
