import {Statement} from "./statement";
import {Form} from "./form";
import * as Combi from "../combi";

let str = Combi.str;

export class Endform extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return str("ENDFORM");
  }

  public isEnd() {
    return true;
  }

  public isValidParent(s) {
    return s instanceof Form;
  }

  public indentationStart() {
    return -2;
  }

}