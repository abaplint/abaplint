import {Statement} from "./_statement";
import {verNot, str, seq, opt, alt, IStatementRunnable} from "../combi";
import {Dynamic, Source, ParameterListS, ParameterListT} from "../expressions";
import {Version} from "../../version";

export class CallDatabase extends Statement {

  public getMatcher(): IStatementRunnable {
    const exporting = seq(str("EXPORTING"), new ParameterListS());
    const importing = seq(str("IMPORTING"), new ParameterListT());
    const expl = seq(opt(exporting), opt(importing));

    const tab = seq(str("PARAMETER-TABLE"), new Source());

    const connection = seq(str("CONNECTION"), new Dynamic());

    const ret = seq(str("CALL DATABASE PROCEDURE"),
                    new Dynamic(),
                    opt(connection),
                    alt(expl, tab));

    return verNot(Version.Cloud, ret);
  }

}