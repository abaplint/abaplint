import { Statement } from "./statement";
import { Token } from "../tokens/tokens";
import * as Combi from "../combi";

let str    = Combi.str;
let seq    = Combi.seq;
let alt    = Combi.alt;
let opt    = Combi.opt;
let reg    = Combi.regex;
let star   = Combi.star;
let sSpace = Combi.str_space;

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
                           opt(sSpace("LINE OF")),
                           opt(sSpace("REF TO")),
                           opt(sSpace("RANGE OF")));
            let def = seq(str("DEFAULT"), constant);
            let length = seq(str("LENGTH"), integer);
            let value = seq(str("VALUE"), reg(/^.+$/));
            let simple = seq(start, variable, opt(seq(type, typename)), opt(def), opt(length), opt(str("READ-ONLY")), opt(value));

            let typetable = alt(sSpace("TYPE STANDARD TABLE OF"),
                                sSpace("TYPE STANDARD TABLE OF REF TO"),
                                sSpace("LIKE STANDARD TABLE OF"),
                                sSpace("TYPE TABLE OF"),
                                sSpace("TYPE HASHED TABLE OF"),
                                sSpace("TYPE SORTED TABLE OF"),
                                sSpace("TYPE TABLE OF REF TO"));
            let key = alt(sSpace("WITH DEFAULT KEY"),
                          sSpace("WITH NON-UNIQUE DEFAULT KEY"),
                          seq(sSpace("WITH NON-UNIQUE KEY"), star(variable)),
                          seq(sSpace("WITH UNIQUE KEY"), star(variable)));
            let initial = seq(sSpace("INITIAL SIZE"), integer);
            let table = seq(start, variable, typetable, typename, opt(key), opt(str("READ-ONLY")), opt(initial));

            let structure = seq(start, alt(sSpace("BEGIN OF"), sSpace("END OF")), variable);

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