import {IStatement} from "./_statement";
import {verNot, str, seqs, alt, opt} from "../combi";
import {SQLTarget, SQLSource, SQLTargetTable} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class FetchNextCursor implements IStatement {

  public getMatcher(): IStatementRunnable {
    const size = seqs("PACKAGE SIZE", SQLSource);

    const record = seqs("INTO",
                        opt(str("CORRESPONDING FIELDS OF")),
                        SQLTarget);

    const ret = seqs("FETCH NEXT CURSOR",
                     SQLSource,
                     alt(record, new SQLTargetTable()),
                     opt(size));

    return verNot(Version.Cloud, ret);
  }

}