import {Statement} from "./statement";
import {verNot, str, seq, opt, IRunnable} from "../combi";
import {IncludeName} from "../expressions";
import {Version} from "../../version";

export class Include extends Statement {
  public getMatcher(): IRunnable {
    let ret = seq(str("INCLUDE"), new IncludeName(), opt(str("IF FOUND")));

    return verNot(Version.Cloud, ret);
  }
}