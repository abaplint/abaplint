import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;

export class AddCorresponding extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(str("ADD-CORRESPONDING"),
                  new Reuse.Source(),
                  str("TO"),
                  new Reuse.Target());

    return ret;
  }

}