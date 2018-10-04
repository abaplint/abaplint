import {Statement} from "./statement";
import {At} from "./at";
import {verNot, str, IRunnable} from "../combi";
import {Version} from "../../version";

export class Endat extends Statement {

  public static get_matcher(): IRunnable {
    let ret = str("ENDAT");
    return verNot(Version.Cloud, ret);
  }

  public isEnd() {
    return true;
  }

  public isValidParent(s: Statement) {
    return s instanceof At;
  }

  public indentationStart(_prev: Statement) {
    return -2;
  }

}