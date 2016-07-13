import { Statement } from "./statement";
import { Token } from "../tokens/";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str  = Combi.str;
let seq  = Combi.seq;
let alt  = Combi.alt;
let opt  = Combi.opt;
let reg  = Combi.regex;
let star = Combi.star;

export class Data extends Statement {

    public static get_matcher(): Combi.IRunnable {
        let start = alt(str("CLASS-DATA"), str("DATA"));
        let type = seq(reg(/^(LIKE|TYPE)$/i),
                       opt(str("LINE OF")),
                       opt(str("REF TO")),
                       opt(str("RANGE OF")));
        let def = seq(str("DEFAULT"), Reuse.constant());
        let length = seq(str("LENGTH"), Reuse.integer());
        let decimals = seq(str("DECIMALS"), Reuse.integer());
        let value = seq(str("VALUE"), reg(/^.+$/));
        let simple = seq(Reuse.field(),
                         opt(seq(str("("), Reuse.integer(), str(")"))),
                         opt(seq(type, Reuse.typename())),
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
                      opt(star(Reuse.field_sub())));
        let initial = seq(str("INITIAL SIZE"), Reuse.integer());
        let table = seq(Reuse.field(),
                        typetable,
                        Reuse.typename(),
                        opt(key),
                        opt(str("READ-ONLY")),
                        opt(initial));

        let structure = seq(alt(str("BEGIN OF"), str("END OF")), Reuse.field());

        return seq(start, alt(simple, table, structure));
    }

    public static match(tokens: Array<Token>): Statement {
        let result = Combi.Combi.run(this.get_matcher( ), tokens, true);
        if (result === true) {
            return new Data(tokens);
        } else {
            return undefined;
        }
    }

    public constructor(tokens: Array<Token>) {
        super(tokens);
    }

}