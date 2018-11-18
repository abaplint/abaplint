import {Statement} from "./_statement";
import {verNot, str, seq, opt, IRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../version";

export class Transfer extends Statement {

  public getMatcher(): IRunnable {
    const length = seq(str("LENGTH"),
                       new Source());

    const ret = seq(str("TRANSFER"),
                    new Source(),
                    str("TO"),
                    new Target(),
                    opt(length));

    return verNot(Version.Cloud, ret);
  }

}