import * as Tokens from "./tokens/";

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

export interface IRunnable {
    run(r: Array<Result>): Array<Result>;
    viz(after: Array<string>): {graph: string, nodes: Array<string> };
}

let counter = 1;

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

    public viz(after: Array<string>) {
        return {graph: "anything;", nodes: [] };
    }
}

class Nothing implements IRunnable {
    public run(r: Array<Result>): Array<Result> {
        return [];
    }

    public viz(after: Array<string>) {
        return {graph: "nothing;", nodes: [] };
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

    public viz(after: Array<string>) {
        let node = "node" + counter++;
        let graph = node + " [label = \"" + this.regexp.source + "\"];\n";
        after.forEach((a) => { graph = graph + node + " -> " + a + ";\n"; });
        return {graph: graph, nodes: [node] };
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

    public viz(after: Array<string>) {
        let node = "node" + counter++;
        let graph = node + " [label = \"\\\"" + this.s + "\\\"\"];\n";
        after.forEach((a) => { graph = graph + node + " -> " + a + ";\n"; });
        return {graph: graph, nodes: [node] };
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

    public viz(after: Array<string>) {
        let res = this.opt.viz(after);
        let nodes = res.nodes.concat(after);
        return {graph: res.graph, nodes: nodes };
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

    public viz(after: Array<string>) {
        let res = this.star.viz(after);
        let graph = res.graph;
// todo, the following is probably wrong, but will work in most cases
        res.nodes.forEach((node) => { graph = graph + node + " -> " + node + ";\n"; });
        return {graph: graph, nodes: res.nodes };
    }
}

class Sequence implements IRunnable {
    private list: Array<IRunnable>;

    constructor(list: IRunnable[]) {
        if (list.length < 2) {
            throw new Error("Sequence, length error");
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

    public viz(after: Array<string>) {
        let graph = "";

        for (let i = this.list.length - 1; i >= 0; i--) {
            let seq = this.list[i].viz(after);
            graph = graph + seq.graph;
            after = seq.nodes;
        }

        return {graph: graph, nodes: after };
    }
}

class Alternative implements IRunnable {
    private list: Array<IRunnable>;

    constructor(list: IRunnable[]) {
        if (list.length < 2) {
            throw new Error("Alternative, length error");
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

    public viz(after: Array<string>) {
        let graph = "";
        let nodes: Array<string> = [];

        for (let opt of this.list) {
            let res = opt.viz(after);
            graph = graph + res.graph;
            nodes = nodes.concat(res.nodes);
        }
        return {graph: graph, nodes: nodes };
    }
}

export class Combi {
    public static viz(name: string, runnable: IRunnable): string {
        let result = "";
        let graph = runnable.viz(["end"]);
        result = "digraph " + name + " {\n" +
            "start [label = \"Start\"];\n" +
            "end [label = \"End\"];\n" +
            graph.graph;
        graph.nodes.forEach((node) => { result = result + "start -> " + node + ";\n"; } );
        result = result + "}";
        return result;
    }

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