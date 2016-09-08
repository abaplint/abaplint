import { Statement } from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str  = Combi.str;
let seq  = Combi.seq;
let alt  = Combi.alt;
let opt  = Combi.opt;

export class Data extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let start = alt(str("CLASS-DATA"), str("DATA"));

    let simple = seq(new Reuse.Field(),
                     opt(new Reuse.FieldLength()),
                     opt(new Reuse.Type()),
                     opt(str("READ-ONLY")),
                     opt(new Reuse.Value()));

    let initial = seq(str("INITIAL SIZE"), new Reuse.Integer());
    let table = seq(new Reuse.Field(),
                    new Reuse.TypeTable(),
                    opt(str("READ-ONLY")),
                    opt(initial));

    let structure = seq(alt(str("BEGIN OF"), str("END OF")), new Reuse.Field());

    return seq(start, alt(simple, table, structure));
  }

}