import { Statement } from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;

export class SetHandler extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(str("SET HANDLER"),
                  new Reuse.Target(),
                  str("FOR"),
                  alt(str("ALL INSTANCES"), new Reuse.Source()),
                  opt(seq(str("ACTIVATION"), new Reuse.Source())));

    return ret;
  }

}