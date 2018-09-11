import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {MacroName} from "../expressions";

export class Define extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("DEFINE"), new MacroName());
    return ret;
  }

  public isStructure() {
    return true;
  }

  public indentationEnd() {
    return 2;
  }

}