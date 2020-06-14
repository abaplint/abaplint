import {IStatement} from "./_statement";
import {verNot, str, seq, alt, opt} from "../combi";
import {SQLTarget, SQLSource, SQLTargetTable} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class FetchNextCursor implements IStatement {

  public getMatcher(): IStatementRunnable {
    const size = seq(str("PACKAGE SIZE"), new SQLSource());

    const record = seq(str("INTO"),
                       opt(str("CORRESPONDING FIELDS OF")),
                       new SQLTarget());

    const ret = seq(str("FETCH NEXT CURSOR"),
                    new SQLSource(),
                    alt(record, new SQLTargetTable()),
                    opt(size));

    return verNot(Version.Cloud, ret);
  }

}