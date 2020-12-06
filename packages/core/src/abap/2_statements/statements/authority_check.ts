import {IStatement} from "./_statement";
import {verNot, seq, opts, alts, pluss} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class AuthorityCheck implements IStatement {

  public getMatcher(): IStatementRunnable {

    const field = seq("FIELD", Source);

    const id = seq("ID",
                   Source,
                   alts(field, "DUMMY"));

    const ret = seq("AUTHORITY-CHECK OBJECT",
                    Source,
                    opts(seq("FOR USER", Source)),
                    pluss(id));

    return verNot(Version.Cloud, ret);
  }

}