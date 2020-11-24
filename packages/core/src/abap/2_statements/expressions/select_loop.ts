import {seq, per, opt, alt, tok, str, ver, star, Expression, optPrio} from "../combi";
import {WParenLeftW, WParenLeft} from "../../1_lexer/tokens";
import {SQLSource, SQLFrom, DatabaseTable, Dynamic, SQLCond, SQLFieldName, SQLAggregation, SQLTargetTable, SQLGroupBy, SQLForAllEntries} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {SQLOrderBy} from "./sql_order_by";
import {SQLHaving} from "./sql_having";
import {SQLTarget} from "./sql_target";

export class SelectLoop extends Expression {
  public getRunnable(): IStatementRunnable {

    const intoList = seq(alt(tok(WParenLeft), tok(WParenLeftW)),
                         star(seq(new SQLTarget(), str(","))),
                         new SQLTarget(),
                         str(")"));
    const intoSimple = seq(opt(str("CORRESPONDING FIELDS OF")), new SQLTarget());

    const into = seq(str("INTO"), alt(intoList, intoSimple));

    const where = seq(str("WHERE"), new SQLCond());

    const comma = opt(ver(Version.v740sp05, str(",")));
    const someField = seq(alt(new SQLFieldName(), new SQLAggregation()), comma);
    const fieldList = seq(star(someField), new SQLFieldName(), comma, star(someField));

// todo, use SQLFieldList instead?
    const fields = alt(str("*"),
                       new Dynamic(),
                       fieldList);

    const client = str("CLIENT SPECIFIED");
    const bypass = str("BYPASSING BUFFER");

    const up = seq(str("UP TO"), new SQLSource(), str("ROWS"));

    const pack = seq(str("PACKAGE SIZE"), new SQLSource());

    const from2 = seq(str("FROM"), new DatabaseTable());

    const tab = seq(new SQLTargetTable(), alt(pack, seq(from2, pack), seq(pack, from2)));

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

    const ret = seq(str("SELECT"),
                    optPrio(str("DISTINCT")),
                    fields,
                    perm);

    return ret;
  }
}