import {Statement} from "./_statement";
import {verNot, str, IRunnable} from "../combi";
import {Version} from "../../version";

export class Stop extends Statement {

  public getMatcher(): IRunnable {
    return verNot(Version.Cloud, str("STOP"));
  }

}