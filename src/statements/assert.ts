import {Statement} from "./statement";
import {str, seq, opt, plus, IRunnable} from "../combi";
import * as Reuse from "./reuse";

export class Assert extends Statement {

  public static get_matcher(): IRunnable {
    let fields = seq(str("FIELDS"), plus(new Reuse.Source()));
    let subkey = seq(str("SUBKEY"), new Reuse.Source());
    let id = seq(str("ID"), new Reuse.NamespaceSimpleName());

    return seq(str("ASSERT"),
               opt(id),
               opt(subkey),
               opt(fields),
               opt(str("CONDITION")), new Reuse.Cond());
  }

}