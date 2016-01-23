import { Statement } from "./statement";
import { Token } from "../tokens/tokens";
import * as Combi from "../combi";

let str  = Combi.str;
let seq  = Combi.seq;
let alt  = Combi.alt;
let opt  = Combi.opt;
let reg  = Combi.regex;
let star = Combi.star;

export class Data extends Statement {

    constructor(tokens: Array<Token>, private name: string) {
        super(tokens);
    }

    public static match(tokens: Array<Token>): Statement {
        let st = Statement.concat(tokens).toUpperCase();
        if (/^(CLASS-)?DATA /.test(st)) {
            let variable = reg(/^\w+(\(\d+\))?$/);
            let typename = reg(/^\w+((->|=>|-)\w+)?$/);
            let constant = reg(/^\w+$/);
            let integer = reg(/^\d+$/);
            let start = alt(str("CLASS-DATA"), str("DATA"));
            let type = seq(alt(str("TYPE"), str("LIKE")),
                           opt(str("LINE OF")),
                           opt(str("REF TO")),
                           opt(str("RANGE OF")));
            let def = seq(str("DEFAULT"), constant);
            let length = seq(str("LENGTH"), integer);
            let decimals = seq(str("DECIMALS"), integer);
            let value = seq(str("VALUE"), reg(/^.+$/));
            let simple = seq(start,
                             variable,
                             opt(seq(type, typename)),
                             opt(def),
                             opt(length),
                             opt(decimals),
                             opt(str("READ-ONLY")),
                             opt(value));

            let typetable = alt(str("TYPE STANDARD TABLE OF"),
                                str("TYPE STANDARD TABLE OF REF TO"),
                                str("LIKE STANDARD TABLE OF"),
                                str("TYPE TABLE OF"),
                                str("TYPE HASHED TABLE OF"),
                                str("TYPE SORTED TABLE OF"),
                                str("TYPE TABLE OF REF TO"));
            let key = alt(str("WITH DEFAULT KEY"),
                          str("WITH NON-UNIQUE DEFAULT KEY"),
                          seq(str("WITH NON-UNIQUE KEY"), star(variable)),
                          seq(str("WITH UNIQUE KEY"), star(variable)));
            let initial = seq(str("INITIAL SIZE"), integer);
            let table = seq(start, variable, typetable, typename, opt(key), opt(str("READ-ONLY")), opt(initial));

            let structure = seq(start, alt(str("BEGIN OF"), str("END OF")), variable);

            let statement = alt(simple, table, structure);

            let result = Combi.Combi.run(statement, tokens, true);
            if (result === true) {
                return new Data(tokens, "foo");
            }
// console.dir(tokens);
        }
        return undefined;
    }

}