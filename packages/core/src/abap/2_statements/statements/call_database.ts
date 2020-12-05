import {IStatement} from "./_statement";
import {verNot, seqs, opt, alt} from "../combi";
import {Dynamic, Source, ParameterListS, ParameterListT, DatabaseConnection} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallDatabase implements IStatement {

  public getMatcher(): IStatementRunnable {
    const exporting = seqs("EXPORTING", ParameterListS);
    const importing = seqs("IMPORTING", ParameterListT);
    const expl = seqs(opt(exporting), opt(importing));

    const tab = seqs("PARAMETER-TABLE", Source);

    const ret = seqs("CALL DATABASE PROCEDURE",
                     Dynamic,
                     opt(new DatabaseConnection()),
                     alt(expl, tab));

    return verNot(Version.Cloud, ret);
  }

}