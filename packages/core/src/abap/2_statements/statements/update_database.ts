import {IStatement} from "./_statement";
import {LanguageVersion} from "../../../version";
import {seq, opt, optPrio, alt, altPrio, star, ver, verNotLang} from "../combi";
import {SQLSource, DatabaseTable, Dynamic, SQLFieldAndValue, SQLCond, DatabaseConnection, SQLClient, ComponentName, SQLIndicators, SQLMappingFromEntity, SQLDmlOptions} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Release} from "../../../version";

export class UpdateDatabase implements IStatement {

  public getMatcher(): IStatementRunnable {
    const parameters = seq(SQLFieldAndValue, star(seq(opt(","), SQLFieldAndValue)));

    const set = seq("SET",
                    alt(parameters, Dynamic),
                    opt(seq("WHERE", SQLCond)));

    const setStructure = seq("INDICATORS SET STRUCTURE", ComponentName);
    const updateIndicators = altPrio(ver(Release.v915, SQLIndicators), ver(Release.v755, setStructure));

    const fromTable = seq("FROM",
                          opt("TABLE"),
                          SQLSource,
                          optPrio(updateIndicators),
                          optPrio(SQLMappingFromEntity));

    const ret = seq("UPDATE",
                    DatabaseTable,
                    opt(SQLClient),
                    opt(DatabaseConnection),
                    opt(alt(fromTable, set)),
                    optPrio(SQLDmlOptions));

    return verNotLang(LanguageVersion.KeyUser, ret);
  }

}
