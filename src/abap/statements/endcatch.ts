import {Statement} from "./statement";
import {verNot, str, IRunnable} from "../combi";
import {Version} from "../../version";

export class EndCatch extends Statement {

  public static get_matcher(): IRunnable {
    let ret = str("ENDCATCH");
    return verNot(Version.Cloud, ret);
  }

}