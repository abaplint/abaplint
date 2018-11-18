import {Statement} from "./_statement";
import {verNot, str, seq, IRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../version";

export class Reserve extends Statement {

  public getMatcher(): IRunnable {
    const ret = seq(str("RESERVE"), new Source(), str("LINES"));

    return verNot(Version.Cloud, ret);
  }

}