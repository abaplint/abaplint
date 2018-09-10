import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, IRunnable} from "../combi";

export class While extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("WHILE"), new Reuse.Cond());
  }

  public isStructure() {
    return true;
  }

  public indentationEnd() {
    return 2;
  }

}