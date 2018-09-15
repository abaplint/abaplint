import {Statement} from "./statement";
import {verNot, str, seq, plus, IRunnable} from "../combi";
import {Integer, Field} from "../expressions";
import {Version} from "../version";

export class CatchSystemExceptions extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("CATCH SYSTEM-EXCEPTIONS"),
                  plus(seq(new Field(), str("="), new Integer())));

    return verNot(Version.Cloud, ret);
  }

  public isStructure() {
    return true;
  }

  public isValidParent() {
    return true;
  }

  public indentationStart() {
    return -2;
  }

  public indentationEnd() {
    return 2;
  }

}