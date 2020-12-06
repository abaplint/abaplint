import {seq, pers, opts, alts, tok, str, stars, Expression, altPrios, optPrios, vers} from "../combi";
import {WParenLeftW, WParenLeft} from "../../1_lexer/tokens";
import {SQLTarget, SQLFieldList, SQLFrom, SQLCond, SQLSource, DatabaseConnection, SQLTargetTable, SQLOrderBy, SQLHaving, SQLForAllEntries} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {SQLGroupBy} from "./sql_group_by";

export class Select extends Expression {
  public getRunnable(): IStatementRunnable {

    const intoList = seq(alts(tok(WParenLeft), tok(WParenLeftW)),
                         stars(seq(SQLTarget, ",")),
                         SQLTarget,
                         ")");
    const intoSimple = seq(opts("CORRESPONDING FIELDS OF"),
                           SQLTarget);

    const into = alts(seq("INTO", alts(intoList, intoSimple)), SQLTargetTable);

    const where = seq("WHERE", SQLCond);

    const up = seq("UP TO", SQLSource, "ROWS");
    const offset = vers(Version.v751, seq("OFFSET", SQLSource));

    const client = str("CLIENT SPECIFIED");
    const bypass = str("BYPASSING BUFFER");

    const fields = seq("FIELDS", SQLFieldList);

    const perm = pers(SQLFrom, into, SQLForAllEntries, where,
                      SQLOrderBy, up, offset, client, SQLHaving, bypass, SQLGroupBy, fields, DatabaseConnection);

    const ret = seq("SELECT",
                    altPrios("DISTINCT", optPrios(seq("SINGLE", optPrios("FOR UPDATE")))),
                    opts(SQLFieldList),
                    perm);

    return ret;
  }
}