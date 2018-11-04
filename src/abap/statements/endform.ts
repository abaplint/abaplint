import {Statement} from "./_statement";
import {verNot, str, IRunnable} from "../combi";
import {Version} from "../../version";

export class Endform extends Statement {

  public getMatcher(): IRunnable {
    let ret = str("ENDFORM");

    return verNot(Version.Cloud, ret);
  }

}