import {Statement} from "./statement";
import {Module} from "./module";
import {verNot, str, IRunnable} from "../combi";
import {Version} from "../version";

export class EndModule extends Statement {

  public static get_matcher(): IRunnable {
    let ret = str("ENDMODULE");
    return verNot(Version.Cloud, ret);
  }

  public isEnd() {
    return true;
  }

  public isValidParent(s) {
    return s instanceof Module;
  }

  public indentationStart() {
    return -2;
  }

}