import {Statement} from "./statement";
import {CatchSystemExceptions} from "./catch_system_exceptions";
import {verNot, str, IRunnable} from "../combi";
import {Version} from "../version";

export class EndCatch extends Statement {

  public static get_matcher(): IRunnable {
    let ret = str("ENDCATCH");
    return verNot(Version.Cloud, ret);
  }

  public isEnd() {
    return true;
  }

  public isValidParent(s) {
    return s instanceof CatchSystemExceptions;
  }

  public indentationStart() {
    return -4;
  }

}