import {Statement} from "./_statement";
import {verNot, str, seq, IStatementRunnable} from "../combi";
import {Version} from "../../version";
import {Target, Source} from "../expressions";

export class Add extends Statement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("ADD"),
                    new Source(),
                    str("TO"),
                    new Target());

    return verNot(Version.Cloud, ret);
  }

}