import {Statement} from "./_statement";
import {verNot, str, seq, IRunnable} from "../combi";
import {Version} from "../../version";
import {Target, Source} from "../expressions";

export class Add extends Statement {

  public getMatcher(): IRunnable {
    let ret = seq(str("ADD"),
                  new Source(),
                  str("TO"),
                  new Target());

    return verNot(Version.Cloud, ret);
  }

}