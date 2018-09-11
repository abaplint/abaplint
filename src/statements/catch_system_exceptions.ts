import {Statement} from "./statement";
import {str, seq, plus, IRunnable} from "../combi";
import {Integer, Field} from "../expressions";

export class CatchSystemExceptions extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("CATCH SYSTEM-EXCEPTIONS"),
               plus(seq(new Field(), str("="), new Integer())));
  }

  public isStructure() {
    return true;
  }

  public isValidParent() {
    return true;
  }

  public indentationStart() {
    return -2;
  }

  public indentationEnd() {
    return 2;
  }

}