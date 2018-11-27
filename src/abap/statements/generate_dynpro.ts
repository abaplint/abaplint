import {Statement} from "./_statement";
import {verNot, str, seq, IStatementRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../version";

export class GenerateDynpro extends Statement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("GENERATE DYNPRO"),
                    new Source(),
                    new Source(),
                    new Source(),
                    new Source(),
                    str("ID"),
                    new Source(),
                    str("MESSAGE"),
                    new Target(),
                    str("LINE"),
                    new Target(),
                    str("WORD"),
                    new Target());

    return verNot(Version.Cloud, ret);
  }

}