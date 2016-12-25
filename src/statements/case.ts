import {Statement} from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;

export class Case extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("CASE"), new Reuse.Source());
  }

  public isStructure() {
    return true;
  }

  public indentationEnd() {
    return 2;
  }

}