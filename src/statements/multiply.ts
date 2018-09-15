import {Statement} from "./statement";
import {verNot, str, seq, IRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../version";

export class Multiply extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("MULTIPLY"),
                  new Target(),
                  str("BY"),
                  new Source());

    return verNot(Version.Cloud, ret);
  }

}