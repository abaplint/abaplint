import {Statement} from "./statement";
import {Class} from "./class";
import {str, IRunnable} from "../combi";

export class Endclass extends Statement {

  public static get_matcher(): IRunnable {
    return str("ENDCLASS");
  }

  public isEnd() {
    return true;
  }

  public isValidParent(s) {
    return s instanceof Class;
  }

  public indentationSetStart() {
    return 0;
  }

}