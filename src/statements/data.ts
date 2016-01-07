import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Data extends Statement {

    constructor(tokens: Array<Token>, private name: string) {
        super(tokens);
    }

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^(CLASS-)?DATA /.test(str)) {
            return new Data(tokens, "foo");
/*
let variable = /\w/;
let typename = /\w/;
let constant = /\w/;
let start = alt("CLASS-DATA", "DATA");
let type = alt("TYPE", "LIKE", "LIKE LINE OF", "TYPE REF TO");
let def = seq("DEFAULT", constant);
let length = seq("LENGTH", integer);
let simple = seq(start, variable, type, typename, opt(def), opt(length));

let typetable = alt("TYPE STANDARD TABLE OF", "TYPE TABLE OF");
let key = "WITH DEFAULT KEY"
let table = seq(start, variable, typetable, typename, opt(key));

let parser = alt(simple, table);
parser.run(tokens);
*/
        }
        return undefined;
    }

}