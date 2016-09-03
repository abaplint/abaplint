import { Statement } from "./statement";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;

export class If extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("IF"), Reuse.cond());
  }

  public isStructure() {
    return true;
  }

  public indentationEnd() {
    return 2;
  }

}