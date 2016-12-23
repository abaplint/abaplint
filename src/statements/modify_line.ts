import { Statement } from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;

export class ModifyLine extends Statement {

  public static get_matcher(): Combi.IRunnable {

    let ret = seq(str("MODIFY"),
                  alt(str("CURRENT LINE"),
                      seq(str("LINE"), new Reuse.Source())),
                  str("FIELD VALUE"),
                  new Reuse.Source(),
                  str("FROM"),
                  new Reuse.Source());

    return ret;
  }

}