import {Statement} from "./statement";
import {verNot, str, seq, IRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../version";

export class Divide extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("DIVIDE"),
                  new Target(),
                  str("BY"),
                  new Source());

    return verNot(Version.Cloud, ret);
  }

}