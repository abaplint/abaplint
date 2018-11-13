import {seq, per, opt, alt, tok, str, star, plus, Expression, IRunnable} from "../combi";
import {WParenLeftW, WParenRightW, WParenLeft} from "../tokens/";
import {Field, DatabaseTable, Dynamic, SQLCond, SQLJoin, SQLCDSParameters, SQLSource} from "./";
import {SQLFieldList} from "./sql_field_list";
import {SQLTarget} from "./sql_target";

export class Select extends Expression {
  public getRunnable(): IRunnable {

    let aas = seq(str("AS"), new Field());

    let from = seq(str("FROM"),
                   opt(tok(WParenLeftW)),
                   alt(new Dynamic(), seq(new DatabaseTable(), opt(new SQLCDSParameters()))),
                   opt(aas));

    let intoList = seq(alt(tok(WParenLeft), tok(WParenLeftW)),
                       star(seq(new SQLTarget(), str(","))),
                       new SQLTarget(),
                       str(")"));
    let intoSimple = seq(opt(str("CORRESPONDING FIELDS OF")),
                         new SQLTarget());

    let intoTable = seq(alt(str("INTO"), str("APPENDING")),
                        opt(str("CORRESPONDING FIELDS OF")),
                        str("TABLE"),
                        new SQLTarget());

    let into = alt(seq(str("INTO"), alt(intoList, intoSimple)), intoTable);

    let connection = seq(str("CONNECTION"), new Dynamic());

    let where = seq(str("WHERE"), new SQLCond());

    let ding = alt(str("ASCENDING"), str("DESCENDING"));

    let order = seq(str("ORDER BY"), alt(plus(seq(new Field(), opt(ding), opt(str(",")))), str("PRIMARY KEY"), new Dynamic()));

    let forAll = seq(str("FOR ALL ENTRIES IN"), new SQLSource());

    let up = seq(str("UP TO"), new SQLSource(), str("ROWS"));

    let client = str("CLIENT SPECIFIED");
    let bypass = str("BYPASSING BUFFER");

    let source = seq(from, star(new SQLJoin()), opt(tok(WParenRightW)));

    let group = seq(str("GROUP BY"), plus(alt(new Field(), new Dynamic())));

    let fields = seq(str("FIELDS"), new SQLFieldList());

    let perm = per(source, into, forAll, where, order, up, client, bypass, group, fields, connection);

    let ret = seq(str("SELECT"),
                  alt(str("DISTINCT"), opt(seq(str("SINGLE"), opt(str("FOR UPDATE"))))),
                  opt(new SQLFieldList()),
                  perm);

    return ret;
  }
}