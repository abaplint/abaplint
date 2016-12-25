import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let star = Combi.star;

export class CallKernel extends Statement {

  public static get_matcher(): Combi.IRunnable {

    let field = seq(str("ID"),
                    new Reuse.Source(),
                    str("FIELD"),
                    new Reuse.Source());

    let ret = seq(str("CALL"), new Reuse.Constant(), star(field));

    return ret;
  }

}