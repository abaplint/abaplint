import {Statement} from "./statement";
import {verNot, str, seq, IRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../version";

export class Hide extends Statement {

  public get_matcher(): IRunnable {
    let ret = seq(str("HIDE"), new Source());

    return verNot(Version.Cloud, ret);
  }

}