import {IStatement} from "./_statement";
import {verNot, str, seq, per} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class GenerateDynpro implements IStatement {

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