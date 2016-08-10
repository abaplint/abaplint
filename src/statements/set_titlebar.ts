import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class SetTitlebar extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let wit = seq(str("WITH"), Reuse.source());

    let program = seq(str("OF PROGRAM"), Reuse.source());

    let ret = seq(str("SET TITLEBAR"), Reuse.source(), opt(program), opt(wit));

    return ret;
  }

}