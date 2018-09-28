import {Statement} from "./statement";
import {str, verNot, IRunnable} from "../combi";
import {Version} from "../../version";

export class EndExec extends Statement {

  public static get_matcher(): IRunnable {
    let ret = str("ENDEXEC");

    return verNot(Version.Cloud, ret);
  }

}