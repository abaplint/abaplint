import {Statement} from "./_statement";
import {verNot, str, seq, IRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../version";

export class Divide extends Statement {

  public getMatcher(): IRunnable {
    let ret = seq(str("DIVIDE"),
                  new Target(),
                  str("BY"),
                  new Source());

    return verNot(Version.Cloud, ret);
  }

}