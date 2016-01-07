import * as Tokens from "./tokens/tokens";

// empty = no matches
// null?

class Result {
    private input: Array<Tokens.Token>;

    public setInput(a: Array<Tokens.Token>) {
        this.input = a;
    }

    public peek(): Tokens.Token {
        return this.input[0];
    }

    public pop() {
        this.input.pop();
    }
}

interface IRunnable {
    run(r: Array<Result>): Array<Result>;
}

class Str implements IRunnable {

    constructor(private s: String) { }

    public run(r: Array<Result>): Array<Result> {
        return [new Result()];
    }

}

class Seq implements IRunnable {
    private list: Array<IRunnable>;

    constructor(first: IRunnable, ...rest: IRunnable[]) {
        this.list.push(first);
        this.list.concat(rest);
    }

    public run(r: Array<Result>): Array<Result> {
        return [new Result()];
    }

}

/*
interface NumberFunction extends Function {
    (n:number): number;
}

function str(s: String): NumberFunction {
    return function(a: number) { return a; }
}
*/
/*
function regex(r: RegEx): Parser {

}

function seq(first: NumberFunction, ...rest: NumberFunction[]): NumberFunction {

}
*/

function str(s: String): IRunnable {
    return new Str(s);
}

let foo = str("Foo");
let input = new Result();
input.setInput([new Tokens.Identifier(10, 10, "foo")]);
foo.run([input]);