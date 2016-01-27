import { Statement } from "./statement";
import { Token } from "../tokens/";
import * as Combi from "../combi";

let str  = Combi.str;
let seq  = Combi.seq;
let alt  = Combi.alt;
let opt  = Combi.opt;
let reg  = Combi.regex;
let star = Combi.star;

export class Data extends Statement {

    constructor(tokens: Array<Token>) {
        super(tokens);
    }

    public static get_matcher(): Combi.IRunnable {
        let variable = reg(/^\w+(\(\d+\))?$/);
        let typename = reg(/^\w+((->|=>|-)\w+)?$/);
        let constant = reg(/^\w+$/);
        let integer = reg(/^\d+$/);
        let start = reg(/^(CLASS-)?DATA$/i);
        let type = seq(reg(/^(LIKE|TYPE)$/i),
                       opt(str("LINE OF")),
                       opt(str("REF TO")),
                       opt(str("RANGE OF")));
        let def = seq(str("DEFAULT"), constant);
        let length = seq(str("LENGTH"), integer);
        let decimals = seq(str("DECIMALS"), integer);
        let value = seq(str("VALUE"), reg(/^.+$/));
        let simple = seq(variable,
                         opt(seq(type, typename)),
                         opt(def),
                         opt(length),
                         opt(decimals),
                         opt(str("READ-ONLY")),
                         opt(value));

        let typetable = seq(reg(/^(LIKE|TYPE)$/i),
                            opt(alt(str("STANDARD"), str("HASHED"), str("SORTED"))),
                            str("TABLE OF"),
                            opt(str("REF TO")));
        let key = seq(str("WITH"),
                      opt(alt(str("NON-UNIQUE"), str("UNIQUE"))),
                      opt(str("DEFAULT")),
                      str("KEY"),
                      opt(star(variable)));
        let initial = seq(str("INITIAL SIZE"), integer);
        let table = seq(variable, typetable, typename, opt(key), opt(str("READ-ONLY")), opt(initial));

        let structure = seq(alt(str("BEGIN OF"), str("END OF")), variable);

        return seq(start, alt(simple, table, structure));
    }

    public static match(tokens: Array<Token>): Statement {
        let st = Statement.concat(tokens).toUpperCase();
        if (/^(CLASS-)?DATA /.test(st)) {
            let statement = this.get_matcher( );
            let result = Combi.Combi.run(statement, tokens, true);
            if (result === true) {
                return new Data(tokens);
            }
// console.dir(tokens);
        }
        return undefined;
    }

}