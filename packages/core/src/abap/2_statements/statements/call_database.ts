import {IStatement} from "./_statement";
import {verNot, seq, opt, alt} from "../combi";
import {Dynamic, Source, ParameterListS, ParameterListT, DatabaseConnection} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallDatabase implements IStatement {

  public getMatcher(): IStatementRunnable {
    const exporting = seq("EXPORTING", ParameterListS);
    const importing = seq("IMPORTING", ParameterListT);
    const expl = seq(opt(exporting), opt(importing));

    const tab = seq("PARAMETER-TABLE", Source);

    const ret = seq("CALL DATABASE PROCEDURE",
                    Dynamic,
                    opt(DatabaseConnection),
                    alt(expl, tab));

    return verNot(Version.Cloud, ret);
  }

}