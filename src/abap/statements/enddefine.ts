import {Statement} from "./statement";
import {Define} from "./define";
import {verNot, str, IRunnable} from "../combi";
import {Version} from "../../version";

export class Enddefine extends Statement {

  public static get_matcher(): IRunnable {
    let ret = str("END-OF-DEFINITION");
    return verNot(Version.Cloud, ret);
  }

  public isEnd() {
    return true;
  }

  public isValidParent(s: Statement) {
    return s instanceof Define;
  }

  public indentationStart() {
    return -2;
  }

}