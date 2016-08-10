import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class ModifyInternal extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let index = seq(str("INDEX"), Reuse.source());
    let from = seq(str("FROM"), Reuse.source());

    let transporting = seq(str("TRANSPORTING"), Reuse.field());

    let options = seq(opt(from), index, opt(from), opt(transporting));

    let ret = seq(str("MODIFY"),
                  Reuse.target(),
                  opt(options));

    return ret;
  }

}