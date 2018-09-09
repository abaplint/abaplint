import {Statement} from "./statement";
import {str, IRunnable} from "../combi";

export class AtUserCommand extends Statement {

  public static get_matcher(): IRunnable {
    return str("AT USER-COMMAND");
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