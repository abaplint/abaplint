import {IStatement} from "./_statement";
import {verNotLang, seq, alt, optPrio, ver} from "../combi";
import {SQLSourceSimple, SQLIntoTable, SQLIntoList, SQLExtendedResult} from "../expressions";
import {LanguageVersion, Release} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {SQLIntoStructure} from "../expressions/sql_into_structure";

export class FetchNextCursor implements IStatement {

  public getMatcher(): IStatementRunnable {
    const size = seq("PACKAGE SIZE", SQLSourceSimple);
    const extResult = optPrio(ver(Release.v766, SQLExtendedResult));

    const ret = seq("FETCH NEXT CURSOR",
                    SQLSourceSimple,
                    alt(SQLIntoStructure, SQLIntoTable, SQLIntoList),
                    extResult,
                    optPrio(size));

    return verNotLang(LanguageVersion.Cloud, ret);
  }

}
