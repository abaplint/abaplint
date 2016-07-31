import { Statement } from "./statement";
import { Token } from "../tokens/";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str  = Combi.str;
let seq  = Combi.seq;
let alt  = Combi.alt;
let opt  = Combi.opt;
let star = Combi.star;

export class Data extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let start = alt(str("CLASS-DATA"), str("DATA"));
    let likeType = alt(str("LIKE"), str("TYPE"));
    let type = seq(likeType,
                   opt(alt(str("LINE OF"),
                           str("REF TO"),
                           str("RANGE OF"))));
    let def = seq(str("DEFAULT"), Reuse.constant());
    let length = seq(str("LENGTH"), Reuse.integer());
    let decimals = seq(str("DECIMALS"), Reuse.integer());
    let value = seq(str("VALUE"), alt(Reuse.constant(), Reuse.field()));
    let simple = seq(Reuse.field(),
                     opt(seq(str("("), Reuse.integer(), str(")"))),
                     opt(seq(type, Reuse.typename())),
                     opt(def),
                     opt(length),
                     opt(decimals),
                     opt(str("READ-ONLY")),
                     opt(value));

    let typetable = seq(str("TYPE"),
                        opt(alt(str("STANDARD"), str("HASHED"), str("SORTED"))),
                        str("TABLE OF"),
                        opt(str("REF TO")));
    let key = seq(str("WITH"),
                  opt(alt(str("NON-UNIQUE"), str("UNIQUE"))),
                  opt(str("DEFAULT")),
                  str("KEY"),
                  star(Reuse.field_sub()));
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
}