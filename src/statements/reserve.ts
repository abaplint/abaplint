import {Statement} from "./statement";
import {verNot, str, seq, IRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../version";

export class Reserve extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("RESERVE"), new Source(), str("LINES"));

    return verNot(Version.Cloud, ret);
  }

}