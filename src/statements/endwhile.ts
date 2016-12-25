import {Statement} from "./statement";
import {While} from "./while";
import * as Combi from "../combi";

let str = Combi.str;

export class Endwhile extends Statement {

  public static get_matcher(): Combi.IRunnable {
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