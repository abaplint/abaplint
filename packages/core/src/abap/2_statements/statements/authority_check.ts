import {IStatement} from "./_statement";
import {verNot, seq, opt, alt, plus} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class AuthorityCheck implements IStatement {

  public getMatcher(): IStatementRunnable {

    const field = seq("FIELD", Source);

    const id = seq("ID",
                   Source,
                   alt(field, "DUMMY"));

    const ret = seq("AUTHORITY-CHECK OBJECT",
                    Source,
                    opt(seq("FOR USER", Source)),
                    plus(id));

    return verNot(Version.Cloud, ret);
  }

}