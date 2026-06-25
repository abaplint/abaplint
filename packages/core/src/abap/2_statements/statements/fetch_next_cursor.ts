import {IStatement} from "./_statement";
import {verNotLang, seq, alt, optPrio} from "../combi";
import {SQLSourceSimple, SQLIntoTable, SQLIntoList} from "../expressions";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {SQLIntoStructure} from "../expressions/sql_into_structure";

export class FetchNextCursor implements IStatement {

  public getMatcher(): IStatementRunnable {
    const size = seq("PACKAGE SIZE", SQLSourceSimple);

    const ret = seq("FETCH NEXT CURSOR",
                    SQLSourceSimple,
                    alt(SQLIntoStructure, SQLIntoTable, SQLIntoList),
                    optPrio(size));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
