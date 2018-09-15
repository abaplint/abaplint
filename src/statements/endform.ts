import {Statement} from "./statement";
import {Form} from "./form";
import {verNot, str, IRunnable} from "../combi";
import {Version} from "../version";

export class Endform extends Statement {

  public static get_matcher(): IRunnable {
    let ret = str("ENDFORM");

    return verNot(Version.Cloud, ret);
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