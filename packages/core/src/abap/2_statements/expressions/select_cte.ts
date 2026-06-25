import {seq, altPrio, optPrio, Expression, ver, starPrio, AlsoIn, verNotLang} from "../combi";
import {SQLFrom, SQLCond, SQLClient, SQLGroupBy, SQLHaving, SQLForAllEntries,
  DatabaseConnection, SQLHints, SQLOptions, SQLPrivilegedAccess, SQLOrderBy} from ".";
import {Release, LanguageVersion} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {SQLFieldListLoopGreedy} from "./sql_field_list_loop_greedy";
import {SQLFieldsLoop} from "./sql_fields_loop";
import {SQLUpTo} from "./sql_up_to";
import {SQLSource} from "./sql_source";
import {SQLSetOpGroup} from "./sql_set_op_group";

export class SelectCTE extends Expression {
  public getRunnable(): IStatementRunnable {
    const where = seq("WHERE", SQLCond);
    const bypass = "BYPASSING BUFFER";
    const privileged = ver(Release.v758, SQLPrivilegedAccess);
    const offset = ver(Release.v751, seq("OFFSET", SQLSource));
    const conn = optPrio(verNotLang(LanguageVersion.KeyUser, DatabaseConnection));

    const groupHaving = seq(optPrio(SQLGroupBy), optPrio(SQLHaving));
    const tail = seq(
      groupHaving,
      optPrio(seq(SQLOrderBy, optPrio(SQLUpTo), optPrio(offset))),
      optPrio(SQLHints),
      optPrio(privileged),
      optPrio(SQLOptions),
      conn,
    );

    const sqlStyle = seq(
      SQLFrom,
      optPrio(SQLClient),
      optPrio(bypass),
      ver(Release.v750, SQLFieldsLoop, {also: AlsoIn.OpenABAP}),
      optPrio(SQLForAllEntries),
      optPrio(where),
      tail,
    );

    const abapStyle = seq(
      optPrio("DISTINCT"),
      SQLFieldListLoopGreedy,
      SQLFrom,
      optPrio(SQLClient),
      optPrio(bypass),
      optPrio(SQLForAllEntries),
      optPrio(where),
      tail,
    );

    const union = seq("UNION", optPrio(altPrio("DISTINCT", "ALL")));
    const intersectExcept = altPrio(seq("INTERSECT", optPrio("DISTINCT")),
                                    seq("EXCEPT", optPrio("DISTINCT")));
    const setOp = altPrio(ver(Release.v750, union, {also: AlsoIn.OpenABAP}),
                          ver(Release.v756, intersectExcept));

    const operandSql = seq(SQLFrom, optPrio(SQLClient), optPrio(bypass), ver(Release.v750, SQLFieldsLoop, {also: AlsoIn.OpenABAP}),
                           optPrio(SQLForAllEntries), optPrio(where), groupHaving);
    const operandAbap = seq(optPrio("DISTINCT"), SQLFieldListLoopGreedy,
                            SQLFrom, optPrio(SQLClient), optPrio(bypass), optPrio(SQLForAllEntries),
                            optPrio(where), groupHaving);
    const operandCore = altPrio(operandSql, operandAbap);
    const unionOperand = altPrio(SQLSetOpGroup, seq("SELECT", operandCore));
    const unionTail = starPrio(seq(setOp, unionOperand));

    const selectBody = seq("SELECT", altPrio(sqlStyle, abapStyle));

    return seq(selectBody, unionTail);
  }
}
