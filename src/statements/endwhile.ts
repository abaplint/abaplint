import {Statement} from "./statement";
import {While} from "./while";
import {str, IRunnable} from "../combi";

export class Endwhile extends Statement {

  public static get_matcher(): IRunnable {
    return str("ENDWHILE");
  }

  public isEnd() {
    return true;
  }

  public isValidParent(s) {
    return s instanceof While;
  }

  public indentationStart() {
    return -2;
  }

}