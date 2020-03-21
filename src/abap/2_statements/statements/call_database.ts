import {IStatement} from "./_statement";
import {verNot, str, seq, opt, alt} from "../combi";
import {Dynamic, Source, ParameterListS, ParameterListT, DatabaseConnection} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallDatabase implements IStatement {

  public getMatcher(): IStatementRunnable {
    const exporting = seq(str("EXPORTING"), new ParameterListS());
    const importing = seq(str("IMPORTING"), new ParameterListT());
    const expl = seq(opt(exporting), opt(importing));

    const tab = seq(str("PARAMETER-TABLE"), new Source());

    const ret = seq(str("CALL DATABASE PROCEDURE"),
                    new Dynamic(),
                    opt(new DatabaseConnection()),
                    alt(expl, tab));

    return verNot(Version.Cloud, ret);
  }

}