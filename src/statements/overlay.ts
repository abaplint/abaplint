import { Statement } from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;

export class Overlay extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(str("OVERLAY"),
                  new Reuse.Target(),
                  str("WITH"),
                  new Reuse.Source());

    return ret;
  }

}