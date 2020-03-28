import {seq, per, opt, alt, tok, str, ver, star, plus, Expression} from "../combi";
import {WParenLeftW, WAt, WParenLeft} from "../../1_lexer/tokens";
import {SQLSource, SQLFrom, DatabaseTable, Dynamic, Target, Source, SQLCond, SQLFieldName, SQLTarget, SQLAggregation} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SelectLoop extends Expression {
  public getRunnable(): IStatementRunnable {

    const intoList = seq(alt(tok(WParenLeft), tok(WParenLeftW)),
                         star(seq(new Target(), str(","))),
                         new Target(),
                         str(")"));
    const intoSimple = seq(opt(str("CORRESPONDING FIELDS OF")),
                           opt(ver(Version.v740sp05, tok(WAt))),
                           new Target());

    const into = seq(str("INTO"), alt(intoList, intoSimple));

    const where = seq(str("WHERE"), new SQLCond());

    const ding = alt(str("ASCENDING"), str("DESCENDING"));

    const order = seq(str("ORDER BY"), alt(plus(seq(new SQLFieldName(), opt(ding))), str("PRIMARY KEY"), new Dynamic()));

    const comma = opt(ver(Version.v740sp05, str(",")));
    const someField = seq(alt(new SQLFieldName(), new SQLAggregation()), comma);
    const fieldList = seq(star(someField), new SQLFieldName(), comma, star(someField));

// todo, use SQLFieldList instead
    const fields = alt(str("*"),
                       new Dynamic(),
                       fieldList);

    const client = str("CLIENT SPECIFIED");
    const bypass = str("BYPASSING BUFFER");

    const up = seq(str("UP TO"), new SQLSource(), str("ROWS"));

    const pack = seq(str("PACKAGE SIZE"), new Source());

    const forAll = seq(str("FOR ALL ENTRIES IN"), new SQLSource());

    const group = seq(str("GROUP BY"), plus(alt(new SQLFieldName(), new Dynamic())));

    const from2 = seq(str("FROM"), new DatabaseTable());

// hmm, this is bad, PACKAGE SIZE is not part of the non-loop?
    const appending = seq(str("APPENDING"),
                          opt(str("CORRESPONDING FIELDS OF")),
                          str("TABLE"),
                          new SQLTarget(),
                          alt(seq(from2, pack), seq(pack, from2)));

    const intoTab = seq(str("INTO"), opt(str("CORRESPONDING FIELDS OF")), str("TABLE"), new SQLTarget(), pack);

    const perm = per(new SQLFrom(), where, up, order, client, bypass, group, forAll, alt(appending, intoTab, into));

    const ret = seq(str("SELECT"),
                    fields,
                    perm);

    return ret;
  }
}