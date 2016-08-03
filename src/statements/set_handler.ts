import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;

export class SetHandler extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(str("SET HANDLER"), Reuse.target(), str("FOR"), Reuse.target());
    return ret;
  }

}