import {IStatement} from "./_statement";
import {verNot, str, seqs, opt, alt, plus} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class AuthorityCheck implements IStatement {

  public getMatcher(): IStatementRunnable {

    const field = seqs("FIELD", Source);

    const id = seqs("ID",
                    Source,
                    alt(field, str("DUMMY")));

    const ret = seqs("AUTHORITY-CHECK OBJECT",
                     Source,
                     opt(seqs("FOR USER", Source)),
                     plus(id));

    return verNot(Version.Cloud, ret);
  }

}