import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let plus = Combi.plus;

export class Assert extends Statement {

  public static get_matcher(): Combi.IRunnable {
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