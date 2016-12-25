import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;

export class If extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("IF"), new Reuse.Cond());
  }

  public isStructure() {
    return true;
  }

  public indentationEnd() {
    return 2;
  }

}