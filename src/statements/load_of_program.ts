import {Statement} from "./statement";
import {str, IRunnable} from "../combi";

export class LoadOfProgram extends Statement {

  public static get_matcher(): IRunnable {
    return str("LOAD-OF-PROGRAM");
  }

  public isStructure() {
    return true;
  }

  public isValidParent(s) {
    return s === undefined;
  }

  public indentationSetStart() {
    return 0;
  }

  public indentationSetEnd() {
    return 2;
  }

}