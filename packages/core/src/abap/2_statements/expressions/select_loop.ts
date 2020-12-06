import {seq, pers, opts, alts, tok, vers, stars, Expression, optPrios} from "../combi";
import {WParenLeftW, WParenLeft} from "../../1_lexer/tokens";
import {SQLSource, SQLFrom, DatabaseTable, Dynamic, SQLCond, SQLFieldName, SQLAggregation, SQLTargetTable, SQLGroupBy, SQLForAllEntries} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {SQLOrderBy} from "./sql_order_by";
import {SQLHaving} from "./sql_having";
import {SQLTarget} from "./sql_target";

export class SelectLoop extends Expression {
  public getRunnable(): IStatementRunnable {

    const intoList = seq(alts(tok(WParenLeft), tok(WParenLeftW)),
                         stars(seq(SQLTarget, ",")),
                         SQLTarget,
                         ")");
    const intoSimple = seq(opts("CORRESPONDING FIELDS OF"), SQLTarget);

    const into = seq("INTO", alts(intoList, intoSimple));

    const where = seq("WHERE", SQLCond);

    const comma = opts(vers(Version.v740sp05, ","));
    const someField = seq(alts(SQLFieldName, SQLAggregation), comma);
    const fieldList = seq(stars(someField), SQLFieldName, comma, stars(someField));

// todo, use SQLFieldList instead?
    const fields = alts("*", Dynamic, fieldList);

    const client = "CLIENT SPECIFIED";
    const bypass = "BYPASSING BUFFER";

    const up = seq("UP TO", SQLSource, "ROWS");

    const pack = seq("PACKAGE SIZE", SQLSource);

    const from2 = seq("FROM", DatabaseTable);

    const tab = seq(SQLTargetTable, alts(pack, seq(from2, pack), seq(pack, from2)));

    const perm = pers(SQLFrom,
                      where,
                      up,
                      SQLOrderBy,
                      SQLHaving,
                      client,
                      bypass,
                      SQLGroupBy,
                      SQLForAllEntries,
                      alts(tab, into));

    const ret = seq("SELECT",
                    optPrios("DISTINCT"),
                    fields,
                    perm);

    return ret;
  }
}