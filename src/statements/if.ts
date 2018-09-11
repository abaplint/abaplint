import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {Cond} from "../expressions";

export class If extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("IF"), new Cond());
  }

  public isStructure() {
    return true;
  }

  public indentationEnd() {
    return 2;
  }

}