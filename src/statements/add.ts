import { Statement } from "./statement";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;

export class Add extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(str("ADD"),
                  Reuse.source().map(),
                  str("TO"),
                  Reuse.target().map());

    return ret;
  }

}