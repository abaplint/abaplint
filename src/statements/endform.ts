import {Statement} from "./statement";
import {Form} from "./form";
import {str, IRunnable} from "../combi";

export class Endform extends Statement {

  public static get_matcher(): IRunnable {
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