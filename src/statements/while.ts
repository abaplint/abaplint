import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;

export class While extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("WHILE"), Reuse.cond());
  }

  public isStructure() {
    return true;
  }

}