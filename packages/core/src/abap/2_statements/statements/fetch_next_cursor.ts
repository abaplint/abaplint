import {IStatement} from "./_statement";
import {verNot, seq, alt, opt} from "../combi";
import {SQLSource, SQLIntoTable} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {SQLIntoStructure} from "../expressions/sql_into_structure";

export class FetchNextCursor implements IStatement {

  public getMatcher(): IStatementRunnable {
    const size = seq("PACKAGE SIZE", SQLSource);

    const ret = seq("FETCH NEXT CURSOR",
                    SQLSource,
                    alt(SQLIntoStructure, SQLIntoTable),
                    opt(size));

    return verNot(Version.Cloud, ret);
  }

}