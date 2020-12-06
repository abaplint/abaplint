import {IStatement} from "./_statement";
import {verNot, seqs, opts, alts} from "../combi";
import {Dynamic, Source, ParameterListS, ParameterListT, DatabaseConnection} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallDatabase implements IStatement {

  public getMatcher(): IStatementRunnable {
    const exporting = seqs("EXPORTING", ParameterListS);
    const importing = seqs("IMPORTING", ParameterListT);
    const expl = seqs(opts(exporting), opts(importing));

    const tab = seqs("PARAMETER-TABLE", Source);

    const ret = seqs("CALL DATABASE PROCEDURE",
                     Dynamic,
                     opts(DatabaseConnection),
                     alts(expl, tab));

    return verNot(Version.Cloud, ret);
  }

}