import {IStatement} from "./_statement";
import {verNot, seqs, alts, opts} from "../combi";
import {SQLTarget, SQLSource, SQLTargetTable} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class FetchNextCursor implements IStatement {

  public getMatcher(): IStatementRunnable {
    const size = seqs("PACKAGE SIZE", SQLSource);

    const record = seqs("INTO",
                        opts("CORRESPONDING FIELDS OF"),
                        SQLTarget);

    const ret = seqs("FETCH NEXT CURSOR",
                     SQLSource,
                     alts(record, SQLTargetTable),
                     opts(size));

    return verNot(Version.Cloud, ret);
  }

}