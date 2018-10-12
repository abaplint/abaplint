import {Statement} from "./statement";
import {verNot, str, IRunnable} from "../combi";
import {Version} from "../../version";

export class LoadOfProgram extends Statement {

  public getMatcher(): IRunnable {
    let ret = str("LOAD-OF-PROGRAM");

    return verNot(Version.Cloud, ret);
  }

}