import {Statement} from "./_statement";
import {verNot, str, seq, IStatementRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../version";

export class Multiply extends Statement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("MULTIPLY"),
                    new Target(),
                    str("BY"),
                    new Source());

    return verNot(Version.Cloud, ret);
  }

}