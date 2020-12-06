import {IStatement} from "./_statement";
import {verNot, seq, opts, alts} from "../combi";
import {Dynamic, Source, ParameterListS, ParameterListT, DatabaseConnection} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallDatabase implements IStatement {

  public getMatcher(): IStatementRunnable {
    const exporting = seq("EXPORTING", ParameterListS);
    const importing = seq("IMPORTING", ParameterListT);
    const expl = seq(opts(exporting), opts(importing));

    const tab = seq("PARAMETER-TABLE", Source);

    const ret = seq("CALL DATABASE PROCEDURE",
                    Dynamic,
                    opts(DatabaseConnection),
                    alts(expl, tab));

    return verNot(Version.Cloud, ret);
  }

}