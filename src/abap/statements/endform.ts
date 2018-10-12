import {Statement} from "./statement";
import {verNot, str, IRunnable} from "../combi";
import {Version} from "../../version";

export class Endform extends Statement {

  public get_matcher(): IRunnable {
    let ret = str("ENDFORM");

    return verNot(Version.Cloud, ret);
  }

}