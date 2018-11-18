import {Statement} from "./_statement";
import {verNot, str, IRunnable} from "../combi";
import {Version} from "../../version";

export class LoadOfProgram extends Statement {

  public getMatcher(): IRunnable {
    const ret = str("LOAD-OF-PROGRAM");

    return verNot(Version.Cloud, ret);
  }

}