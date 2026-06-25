import {IStatement} from "./_statement";
import {seq, alt, opt, tok, optPrio, verNotLang} from "../combi";
import {DatabaseTable, SQLSource, Select, DatabaseConnection, SQLClient, SQLIndicators, SQLMappingFromEntity, SQLDmlOptions} from "../expressions";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class InsertDatabase implements IStatement {

  public getMatcher(): IStatementRunnable {
    const sub = seq(tok(WParenLeftW), Select, tok(WParenRightW));

    const fromItabOrWa = seq("FROM",
                             opt("TABLE"),
                             SQLSource,
                             optPrio(SQLIndicators),
                             optPrio(SQLMappingFromEntity));
    const fromSubquery = seq("FROM", sub);
    const fromClause = alt(fromItabOrWa, fromSubquery);

    const fromTrailer = seq(opt(SQLClient),
                            opt(DatabaseConnection),
                            fromClause,
                            opt("ACCEPTING DUPLICATE KEYS"),
                            optPrio(SQLDmlOptions));

    const insertFromForm = seq(DatabaseTable,
                               opt(alt(fromTrailer, SQLClient, DatabaseConnection)));

    const insertIntoForm = seq("INTO",
                               DatabaseTable,
                               opt(SQLClient),
                               opt(DatabaseConnection),
                               "VALUES",
                               SQLSource,
                               optPrio(SQLIndicators),
                               optPrio(SQLMappingFromEntity),
                               optPrio(SQLDmlOptions));

    return verNotLang(LanguageVersion.KeyUser,
                      seq("INSERT", alt(insertFromForm, insertIntoForm)));
  }

}
