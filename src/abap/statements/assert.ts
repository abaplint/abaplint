import {Statement} from "./statement";
import {str, seq, opt, plus, IRunnable} from "../combi";
import {Source, NamespaceSimpleName, Cond} from "../expressions";

export class Assert extends Statement {

  public get_matcher(): IRunnable {
    let fields = seq(str("FIELDS"), plus(new Source()));
    let subkey = seq(str("SUBKEY"), new Source());
    let id = seq(str("ID"), new NamespaceSimpleName());

    return seq(str("ASSERT"),
               opt(id),
               opt(subkey),
               opt(fields),
               opt(str("CONDITION")), new Cond());
  }

}