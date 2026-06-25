import {IStatement} from "./_statement";
import {seq, optPrio, opt, altPrio, ver, verNotLang} from "../combi";
import {Dynamic, SQLCond, DatabaseTable, SQLSourceSimple, DatabaseConnection, SQLOrderBy, SQLUpTo, SQLOffset, SQLMappingFromEntity, SQLIndicators, SQLDmlOptions} from "../expressions";
import {LanguageVersion, Release} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {SQLClient} from "../expressions/sql_client";

export class DeleteDatabase implements IStatement {

  public getMatcher(): IStatementRunnable {
    const where = seq("WHERE", altPrio(SQLCond, Dynamic));

    const upToOffset = ver(Release.v764, altPrio(
      seq(SQLUpTo, optPrio(SQLOffset)),
      seq(SQLOffset, optPrio(SQLUpTo)),
    ));
    const orderByTail = ver(Release.v764, seq(SQLOrderBy, optPrio(upToOffset)));
    const trailing = optPrio(altPrio(orderByTail, upToOffset));

    const from = seq("FROM", DatabaseTable, optPrio(SQLClient), optPrio(DatabaseConnection),
                     opt(where), trailing, optPrio(SQLDmlOptions));

    const fromSomething = seq("FROM", opt("TABLE"), SQLSourceSimple, optPrio(SQLIndicators), optPrio(SQLMappingFromEntity));

    const table = seq(DatabaseTable,
                      optPrio(SQLClient),
                      optPrio(DatabaseConnection),
                      optPrio(fromSomething),
                      optPrio(SQLDmlOptions));

    const ret = seq("DELETE", altPrio(from, table));

    return verNotLang(LanguageVersion.KeyUser, ret);
  }

}
