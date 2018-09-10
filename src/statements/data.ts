import {Statement} from "./statement";
import {str, seq, alt, opt, per, IRunnable} from "../combi";
import * as Reuse from "./reuse";
import {Integer} from "../expressions";

export class Data extends Statement {

  public static get_matcher(): IRunnable {
    let start = alt(str("CLASS-DATA"), str("DATA"));

    let simple = seq(opt(new Reuse.FieldLength()),
                     opt(new Reuse.Type()),
                     opt(per(str("READ-ONLY"), new Reuse.Value())));

    let initial = seq(str("INITIAL SIZE"), new Integer());

    let table = seq(new Reuse.TypeTable(),
                    opt(str("READ-ONLY")),
                    opt(initial));

    return seq(start, new Reuse.NamespaceSimpleName(), alt(simple, table));
  }

}