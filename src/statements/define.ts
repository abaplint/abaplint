import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import * as Reuse from "./reuse";

export class Define extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("DEFINE"), new Reuse.MacroName());
    return ret;
  }

  public isStructure() {
    return true;
  }

  public indentationEnd() {
    return 2;
  }

}