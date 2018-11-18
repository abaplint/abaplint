import {Statement} from "./_statement";
import {verNot, str, seq, IRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../version";

export class Multiply extends Statement {

  public getMatcher(): IRunnable {
    const ret = seq(str("MULTIPLY"),
                    new Target(),
                    str("BY"),
                    new Source());

    return verNot(Version.Cloud, ret);
  }

}