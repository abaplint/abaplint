import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;

export class SetTitlebar extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(str("SET TITLEBAR"), Reuse.source());
    return ret;
  }

}