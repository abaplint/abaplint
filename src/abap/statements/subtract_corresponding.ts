import {Statement} from "./_statement";
import {verNot, str, seq, IRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../version";

export class SubtractCorresponding extends Statement {

  public getMatcher(): IRunnable {
    const ret = seq(str("SUBTRACT-CORRESPONDING"),
                    new Source(),
                    str("FROM"),
                    new Target());

    return verNot(Version.Cloud, ret);
  }

}