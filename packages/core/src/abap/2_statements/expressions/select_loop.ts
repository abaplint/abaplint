import {seq, per, opt, alt, tok, ver, star, Expression, optPrio} from "../combi";
import {WParenLeftW, WParenLeft} from "../../1_lexer/tokens";
import {SQLSource, SQLFrom, DatabaseTable, Dynamic, SQLCond, SQLFieldName, SQLAggregation, SQLTargetTable, SQLGroupBy, SQLForAllEntries} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {SQLOrderBy} from "./sql_order_by";
import {SQLHaving} from "./sql_having";
import {SQLTarget} from "./sql_target";
import {SQLPath} from "./sql_path";
import {SQLAsName} from "./sql_as_name";

export class SelectLoop extends Expression {
  public getRunnable(): IStatementRunnable {

    const intoList = seq(alt(tok(WParenLeft), tok(WParenLeftW)),
                         star(seq(SQLTarget, ",")),
                         SQLTarget,
                         ")");
    const intoSimple = seq(opt("CORRESPONDING FIELDS OF"), SQLTarget);

    const into = seq("INTO", alt(intoList, intoSimple));

    const where = seq("WHERE", SQLCond);

    const comma = opt(ver(Version.v740sp05, ","));
    const as = seq("AS", SQLAsName);
    const someField = seq(alt(SQLFieldName, SQLPath, SQLAggregation), optPrio(as), comma);
    const fieldList = seq(star(someField), alt(SQLFieldName, SQLPath), optPrio(as), comma, star(someField));

// todo, use SQLFieldList instead?
    const fields = alt("*", Dynamic, fieldList);

    const client = "CLIENT SPECIFIED";
    const bypass = "BYPASSING BUFFER";

    const up = seq("UP TO", SQLSource, "ROWS");

    const pack = seq("PACKAGE SIZE", SQLSource);

    const from2 = seq("FROM", DatabaseTable);

    const tab = seq(SQLTargetTable, alt(pack, seq(from2, pack), seq(pack, from2)));

    const perm = per(SQLFrom,
                     where,
                     up,
                     SQLOrderBy,
                     SQLHaving,
                     client,
                     bypass,
                     SQLGroupBy,
                     SQLForAllEntries,
                     alt(tab, into));

    const ret = seq("SELECT",
                    optPrio("DISTINCT"),
                    fields,
                    perm);

    return ret;
  }
}