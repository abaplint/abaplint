import {IStatement} from "./_statement";
import {seq, optPrio, alt, altPrio, tok, ver, verNotLang, starPrio} from "../combi";
import {WParenLeftW, WParenRightW, WAt} from "../../1_lexer/tokens";
import {LanguageVersion, Release} from "../../../version";
import {DatabaseTable, SQLAsName, SQLCond, SQLField, SQLFieldName, Dynamic, SQLPrivilegedAccess, SQLClient} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {buildSelectCore} from "../expressions/_select_core";

export class MergeDatabase implements IStatement {

  public getMatcher(): IStatementRunnable {
    const targetSpec = seq(DatabaseTable, optPrio(seq("AS", SQLAsName)));

    const subSelect = seq(tok(WParenLeftW), "SELECT", buildSelectCore(false, false), tok(WParenRightW),
                          optPrio(seq("AS", SQLAsName)));
    const itabSource = seq(tok(WAt), SQLAsName, "AS", SQLAsName,
                           optPrio(seq("DECLARE CLIENT", SQLFieldName)));
    const tableSource = seq(DatabaseTable, optPrio(seq("AS", SQLAsName)));
    const usingClause = seq("USING", altPrio(subSelect, itabSource, tableSource));

    const onClause = seq("ON", SQLCond);

    const setEntry = seq(SQLFieldName, "=", SQLField);
    const setList = seq(setEntry, starPrio(seq(",", setEntry)));
    const matchedAction = altPrio(
      "DELETE",
      seq("UPDATE", altPrio("ALL", seq("SET", setList))),
    );

    const whenMatched = seq("WHEN MATCHED",
                            optPrio(seq("AND", SQLCond)),
                            "THEN",
                            matchedAction);

    const insertCols = seq(tok(WParenLeftW), SQLFieldName, starPrio(seq(",", SQLFieldName)), tok(WParenRightW));
    const insertValues = seq(tok(WParenLeftW), SQLField, starPrio(seq(",", SQLField)), tok(WParenRightW));
    const notMatchedAction = seq("INSERT",
                                 altPrio("ALL", seq(insertCols, "VALUES", insertValues)));

    const whenNotMatched = seq("WHEN NOT MATCHED",
                               optPrio(seq("AND", SQLCond)),
                               "THEN",
                               notMatchedAction);

    const whenClauses = altPrio(
      seq(whenMatched, optPrio(whenNotMatched)),
      whenNotMatched,
    );

    const optionsClause = seq("OPTIONS",
                              altPrio(SQLPrivilegedAccess, SQLClient,
                                      seq(SQLClient, SQLPrivilegedAccess),
                                      seq(SQLPrivilegedAccess, SQLClient)));
    const trailingOptions = optPrio(optionsClause);

    const staticForm = seq("INTO", targetSpec,
                           optPrio(usingClause),
                           optPrio(onClause),
                           optPrio(whenClauses),
                           trailingOptions);

    const ret = ver(Release.v917, seq("MERGE", alt(staticForm, Dynamic)));
    return verNotLang(LanguageVersion.KeyUser, ret);
  }

}
