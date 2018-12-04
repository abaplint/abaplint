import {Statement} from "./_statement";
import {verNot, str, seq, per, IStatementRunnable} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../version";

export class GenerateDynpro extends Statement {

  public getMatcher(): IStatementRunnable {

    const line = seq(str("LINE"), new Target());
    const word = seq(str("WORD"), new Target());

    const ret = seq(str("GENERATE DYNPRO"),
                    new Source(),
                    new Source(),
                    new Source(),
                    new Source(),
                    str("ID"),
                    new Source(),
                    str("MESSAGE"),
                    new Target(),
                    per(line, word));

    return verNot(Version.Cloud, ret);
  }

}