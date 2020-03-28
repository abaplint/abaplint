import {IStatement} from "./_statement";
import {verNot, str, seq, per} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class GenerateSubroutine implements IStatement {

  public getMatcher(): IStatementRunnable {
    const name = seq(str("NAME"), new Source());
    const message = seq(str("MESSAGE"), new Target());
    const messageid = seq(str("MESSAGE-ID"), new Target());
    const line = seq(str("LINE"), new Target());
    const word = seq(str("WORD"), new Target());
    const offset = seq(str("OFFSET"), new Target());
    const short = seq(str("SHORTDUMP-ID"), new Target());
    const include = seq(str("INCLUDE"), new Target());

    const ret = seq(str("GENERATE SUBROUTINE POOL"),
                    new Source(),
                    per(name, message, line, word, include, offset, messageid, short));

    return verNot(Version.Cloud, ret);
  }

}