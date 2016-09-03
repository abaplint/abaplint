import { Statement } from "./statement";
import { If } from "./if";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str  = Combi.str;
let seq  = Combi.seq;

export class Elseif extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("ELSEIF"), Reuse.cond());
  }

  public isStructure() {
    return true;
  }

  public isValidParent(s) {
    return s instanceof If;
  }

  public indentationStart() {
    return -2;
  }

  public indentationEnd() {
    return 2;
  }

}