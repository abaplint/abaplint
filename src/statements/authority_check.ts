import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let plus = Combi.plus;

export class AuthorityCheck extends Statement {

  public static get_matcher(): Combi.IRunnable {

    let id = seq(str("ID"),
                 Reuse.source(),
                 str("FIELD"),
                 Reuse.source());

    let ret = seq(str("AUTHORITY-CHECK OBJECT"),
                  Reuse.source(),
                  opt(seq(str("FOR USER"), Reuse.source())),
                  plus(id));

    return ret;
  }

}