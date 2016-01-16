import { Statement } from "./statement";
import { Token } from "../tokens/tokens";
import * as Combi from "../combi";

let str    = Combi.str;
let seq    = Combi.seq;
let alt    = Combi.alt;
let opt    = Combi.opt;
let reg    = Combi.regex;
let sSpace = Combi.str_space;

export class Data extends Statement {

    constructor(tokens: Array<Token>, private name: string) {
        super(tokens);
    }

    public static match(tokens: Array<Token>): Statement {
        let st = Statement.concat(tokens).toUpperCase();
        if (/^(CLASS-)?DATA /.test(st)) {

            let variable = reg(/^\w+$/);
            let typename = reg(/^\w+$/);
            let constant = reg(/^\w+$/);
            let integer = reg(/^\d+$/);
            let start = alt(str("CLASS-DATA"), str("DATA"));
            let type = seq(alt(str("TYPE"), str("LIKE")), opt(sSpace("LINE OF")), opt(sSpace("REF TO")));
            let def = seq(str("DEFAULT"), constant);
            let length = seq(str("LENGTH"), integer);
            let simple = seq(start, variable, type, typename, opt(def), opt(length));

            let typetable = alt(sSpace("TYPE STANDARD TABLE OF"), sSpace("TYPE TABLE OF"));
            let key = sSpace("WITH DEFAULT KEY");
            let table = seq(start, variable, typetable, typename, opt(key));

            let statement = alt(simple, table);
            let result = Combi.Combi.run(statement, tokens);
            console.log("result: " + result + ", " + st);

            return new Data(tokens, "foo");
        }
        return undefined;
    }

}