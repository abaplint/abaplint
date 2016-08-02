import { Statement } from "./statement";
import { Token } from "../tokens/";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str  = Combi.str;
let seq  = Combi.seq;
let alt  = Combi.alt;
let opt  = Combi.opt;

export class Data extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let start = alt(str("CLASS-DATA"), str("DATA"));

    let value = seq(str("VALUE"), alt(Reuse.constant(), Reuse.field_chain()));
    let simple = seq(Reuse.field(),
                     opt(seq(str("("), Reuse.integer(), str(")"))),
                     opt(Reuse.type()),
                     opt(str("READ-ONLY")),
                     opt(value));

    let initial = seq(str("INITIAL SIZE"), Reuse.integer());
    let table = seq(Reuse.field(),
                    Reuse.type_table(),
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