import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import * as Reuse from "./reuse";

export class If extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("IF"), new Reuse.Cond());
  }

  public isStructure() {
    return true;
  }

  public indentationEnd() {
    return 2;
  }

}