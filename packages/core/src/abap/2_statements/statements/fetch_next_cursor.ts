import {IStatement} from "./_statement";
import {verNot, seq, alt, opt} from "../combi";
import {SQLTarget, SQLSource, SQLTargetTable} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class FetchNextCursor implements IStatement {

  public getMatcher(): IStatementRunnable {
    const size = seq("PACKAGE SIZE", SQLSource);

    const record = seq("INTO",
                       opt("CORRESPONDING FIELDS OF"),
                       SQLTarget);

    const ret = seq("FETCH NEXT CURSOR",
                    SQLSource,
                    alt(record, SQLTargetTable),
                    opt(size));

    return verNot(Version.Cloud, ret);
  }

}