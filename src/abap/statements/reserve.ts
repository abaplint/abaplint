import {Statement} from "./statement";
import {verNot, str, seq, IRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../version";

export class Reserve extends Statement {

  public getMatcher(): IRunnable {
    let ret = seq(str("RESERVE"), new Source(), str("LINES"));

    return verNot(Version.Cloud, ret);
  }

}