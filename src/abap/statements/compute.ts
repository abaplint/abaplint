import {Statement} from "./statement";
import {verNot, str, seq, opt, IRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../version";

export class Compute extends Statement {

  public get_matcher(): IRunnable {
    let ret = seq(str("COMPUTE"),
                  opt(str("EXACT")),
                  new Target(),
                  str("="),
                  new Source());

    return verNot(Version.Cloud, ret);
  }

}