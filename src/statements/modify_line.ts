import { Statement } from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;

export class ModifyLine extends Statement {

  public static get_matcher(): Combi.IRunnable {

    let ret = seq(str("MODIFY LINE"),
                  new Reuse.Source(),
                  str("FIELD VALUE"),
                  new Reuse.Source(),
                  str("FROM"),
                  new Reuse.Source());

    return ret;
  }

}