import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;

export class Pack extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("PACK"), new Reuse.Source(), str("TO"), new Reuse.Target());
  }

}