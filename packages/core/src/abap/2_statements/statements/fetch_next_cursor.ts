import {IStatement} from "./_statement";
import {verNot, seq, alts, opts} from "../combi";
import {SQLTarget, SQLSource, SQLTargetTable} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class FetchNextCursor implements IStatement {

  public getMatcher(): IStatementRunnable {
    const size = seq("PACKAGE SIZE", SQLSource);

    const record = seq("INTO",
                       opts("CORRESPONDING FIELDS OF"),
                       SQLTarget);

    const ret = seq("FETCH NEXT CURSOR",
                    SQLSource,
                    alts(record, SQLTargetTable),
                    opts(size));

    return verNot(Version.Cloud, ret);
  }

}