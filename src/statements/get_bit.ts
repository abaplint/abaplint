import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;

export class GetBit extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let ret = seq(str("GET BIT"),
                  new Reuse.Source(),
                  str("OF"),
                  new Reuse.Source(),
                  str("INTO"),
                  new Reuse.Target());

    return ret;
  }

}