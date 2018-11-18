import {Statement} from "./_statement";
import {verNot, str, IRunnable} from "../combi";
import {Version} from "../../version";

export class EndOn extends Statement {

  public getMatcher(): IRunnable {
    const ret = str("ENDON");
    return verNot(Version.Cloud, ret);
  }

}