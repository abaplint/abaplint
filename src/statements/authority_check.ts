import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;

export class AuthorityCheck extends Statement {

  public static get_matcher(): Combi.IRunnable {
// todo
    let ret = seq(str("AUTHORITY-CHECK OBJECT"),
                  Reuse.source(),
                  str("ID"),
                  Reuse.source(),
                  str("FIELD"),
                  Reuse.source());

    return ret;
  }

}