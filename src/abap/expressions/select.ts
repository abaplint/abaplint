import {seq, per, opt, alt, tok, str, star, plus, Expression, IStatementRunnable} from "../combi";
import {WParenLeftW, WParenLeft} from "../tokens/";
import {SQLTarget, SQLFieldList, SQLFrom, Field, Dynamic, SQLCond, SQLSource} from "./";

export class Select extends Expression {
  public getRunnable(): IStatementRunnable {

    const intoList = seq(alt(tok(WParenLeft), tok(WParenLeftW)),
                         star(seq(new SQLTarget(), str(","))),
                         new SQLTarget(),
                         str(")"));
    const intoSimple = seq(opt(str("CORRESPONDING FIELDS OF")),
                           new SQLTarget());

    const intoTable = seq(alt(str("INTO"), str("APPENDING")),
                          opt(str("CORRESPONDING FIELDS OF")),
                          str("TABLE"),
                          new SQLTarget());

    const into = alt(seq(str("INTO"), alt(intoList, intoSimple)), intoTable);

    const connection = seq(str("CONNECTION"), new Dynamic());

    const where = seq(str("WHERE"), new SQLCond());

    const ding = alt(str("ASCENDING"), str("DESCENDING"));

    const order = seq(str("ORDER BY"), alt(plus(seq(new Field(), opt(ding), opt(str(",")))), str("PRIMARY KEY"), new Dynamic()));

    const forAll = seq(str("FOR ALL ENTRIES IN"), new SQLSource());

    const up = seq(str("UP TO"), new SQLSource(), str("ROWS"));

    const client = str("CLIENT SPECIFIED");
    const bypass = str("BYPASSING BUFFER");

    const group = seq(str("GROUP BY"), plus(alt(new Field(), new Dynamic())));

    const fields = seq(str("FIELDS"), new SQLFieldList());

    const perm = per(new SQLFrom(), into, forAll, where, order, up, client, bypass, group, fields, connection);

    const ret = seq(str("SELECT"),
                    alt(str("DISTINCT"), opt(seq(str("SINGLE"), opt(str("FOR UPDATE"))))),
                    opt(new SQLFieldList()),
                    perm);

    return ret;
  }
}