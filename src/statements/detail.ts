import {Statement} from "./statement";
import {verNot, str, IRunnable} from "../combi";
import {Version} from "../version";

export class Detail extends Statement {
  public static get_matcher(): IRunnable {
    let ret = str("DETAIL");

    return verNot(Version.Cloud, ret);
  }
}