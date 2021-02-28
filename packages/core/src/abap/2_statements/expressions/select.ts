import {seq, per, opt, alt, tok, str, starPrio, Expression, altPrio, optPrio, ver} from "../combi";
import {WParenLeftW, WParenLeft} from "../../1_lexer/tokens";
import {SQLTarget, SQLFieldList, SQLFrom, SQLCond, SQLSource, DatabaseConnection, SQLTargetTable, SQLOrderBy, SQLHaving, SQLForAllEntries} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {SQLGroupBy} from "./sql_group_by";

export class Select extends Expression {
  public getRunnable(): IStatementRunnable {

    const intoList = seq(alt(tok(WParenLeft), tok(WParenLeftW)),
                         starPrio(seq(SQLTarget, ",")),
                         SQLTarget,
                         ")");
    const intoSimple = seq(optPrio("CORRESPONDING FIELDS OF"),
                           SQLTarget);

    const into = alt(seq("INTO", altPrio(intoList, intoSimple)), SQLTargetTable);

    const where = seq("WHERE", SQLCond);

    const up = seq("UP TO", SQLSource, "ROWS");
    const offset = ver(Version.v751, seq("OFFSET", SQLSource));

    const client = str("CLIENT SPECIFIED");
    const bypass = str("BYPASSING BUFFER");

    const fields = seq("FIELDS", SQLFieldList);

    const perm = per(SQLFrom, into, SQLForAllEntries, where,
                     SQLOrderBy, up, offset, client, SQLHaving, bypass, SQLGroupBy, fields, DatabaseConnection);

    const ret = seq("SELECT",
                    altPrio("DISTINCT", optPrio(seq("SINGLE", optPrio("FOR UPDATE")))),
                    opt(SQLFieldList),
                    perm);

    return ret;
  }
}