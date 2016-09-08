import { Statement } from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class SetTitlebar extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let wit = seq(str("WITH"), new Reuse.Source());

    let program = seq(str("OF PROGRAM"), new Reuse.Source());

    let ret = seq(str("SET TITLEBAR"), new Reuse.Source(), opt(program), opt(wit));

    return ret;
  }

}