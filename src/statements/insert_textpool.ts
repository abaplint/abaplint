import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;

export class InsertTextpool extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(str("INSERT TEXTPOOL"),
                  Reuse.source(),
                  str("FROM"),
                  Reuse.source(),
                  str("LANGUAGE"),
                  Reuse.source(),
                  str("STATE"),
                  Reuse.source());

    return ret;
  }

}