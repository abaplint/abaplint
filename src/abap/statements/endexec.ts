import {Statement} from "./_statement";
import {str, verNot, IRunnable} from "../combi";
import {Version} from "../../version";

export class EndExec extends Statement {

  public getMatcher(): IRunnable {
    let ret = str("ENDEXEC");

    return verNot(Version.Cloud, ret);
  }

}