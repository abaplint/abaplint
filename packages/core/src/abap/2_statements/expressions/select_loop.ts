import {seqs, per, opt, alt, tok, str, ver, star, Expression, optPrio} from "../combi";
import {WParenLeftW, WParenLeft} from "../../1_lexer/tokens";
import {SQLSource, SQLFrom, DatabaseTable, Dynamic, SQLCond, SQLFieldName, SQLAggregation, SQLTargetTable, SQLGroupBy, SQLForAllEntries} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {SQLOrderBy} from "./sql_order_by";
import {SQLHaving} from "./sql_having";
import {SQLTarget} from "./sql_target";

export class SelectLoop extends Expression {
  public getRunnable(): IStatementRunnable {

    const intoList = seqs(alt(tok(WParenLeft), tok(WParenLeftW)),
                          star(seqs(SQLTarget, ",")),
                          SQLTarget,
                          ")");
    const intoSimple = seqs(opt(str("CORRESPONDING FIELDS OF")), SQLTarget);

    const into = seqs("INTO", alt(intoList, intoSimple));

    const where = seqs("WHERE", SQLCond);

    const comma = opt(ver(Version.v740sp05, str(",")));
    const someField = seqs(alt(new SQLFieldName(), new SQLAggregation()), comma);
    const fieldList = seqs(star(someField), SQLFieldName, comma, star(someField));

// todo, use SQLFieldList instead?
    const fields = alt(str("*"),
                       new Dynamic(),
                       fieldList);

    const client = str("CLIENT SPECIFIED");
    const bypass = str("BYPASSING BUFFER");

    const up = seqs("UP TO", SQLSource, "ROWS");

    const pack = seqs("PACKAGE SIZE", SQLSource);

    const from2 = seqs("FROM", DatabaseTable);

    const tab = seqs(SQLTargetTable, alt(pack, seqs(from2, pack), seqs(pack, from2)));

    const perm = per(new SQLFrom(),
                     where,
                     up,
                     new SQLOrderBy(),
                     new SQLHaving(),
                     client,
                     bypass,
                     new SQLGroupBy(),
                     new SQLForAllEntries(),
                     alt(tab, into));

    const ret = seqs("SELECT",
                     optPrio(str("DISTINCT")),
                     fields,
                     perm);

    return ret;
  }
}