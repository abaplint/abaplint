import {Statement} from "./_statement";
import {str, verNot, IRunnable} from "../combi";
import {Version} from "../../version";

export class EndExec extends Statement {

  public getMatcher(): IRunnable {
    const ret = str("ENDEXEC");

    return verNot(Version.Cloud, ret);
  }

}