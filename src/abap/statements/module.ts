import {Statement} from "./statement";
import {verNot, str, seq, alt, opt, IRunnable} from "../combi";
import {FormName} from "../expressions";
import {Version} from "../../version";

export class Module extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("MODULE"),
                  new FormName(),
                  opt(alt(str("INPUT"), str("OUTPUT"))));

    return verNot(Version.Cloud, ret);
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

  public indentationEnd() {
    return 2;
  }

}