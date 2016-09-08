import { Statement } from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;

export class CallKernel extends Statement {

  public static get_matcher(): Combi.IRunnable {

    let ret = seq(str("CALL"), new Reuse.Constant());

    return ret;
  }

}