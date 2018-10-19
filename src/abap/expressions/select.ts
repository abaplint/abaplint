import {seq, per, opt, alt, tok, str, ver, star, plus, Expression, IRunnable} from "../combi";
import {WParenLeftW, WAt, WParenRightW, ParenLeft, WParenLeft, ParenLeftW} from "../tokens/";
import {Field, DatabaseTable, Dynamic, Target, Source, SQLCond, SQLJoin} from "./";
import {Version} from "../../version";

export class Select extends Expression {
  public getRunnable(): IRunnable {

    let aas = seq(str("AS"), new Field());

    let from = seq(str("FROM"),
                   opt(tok(WParenLeftW)),
                   alt(new Dynamic(), new DatabaseTable()),
                   opt(aas));

    let intoList = seq(alt(tok(WParenLeft), tok(WParenLeftW)),
                       star(seq(new Target(), str(","))),
                       new Target(),
                       str(")"));
    let intoSimple = seq(opt(str("CORRESPONDING FIELDS OF")),
                         opt(ver(Version.v740sp05, tok(WAt))),
                         new Target());

    let intoTable = seq(alt(str("INTO"), str("APPENDING")),
                        opt(str("CORRESPONDING FIELDS OF")),
                        str("TABLE"),
                        opt(ver(Version.v740sp05, tok(WAt))),
                        new Target());

    let into = alt(seq(str("INTO"), alt(intoList, intoSimple)), intoTable);

    let pack = seq(str("PACKAGE SIZE"), new Source());

    let connection = seq(str("CONNECTION"), new Dynamic());

    let where = seq(str("WHERE"), new SQLCond());

    let ding = alt(str("ASCENDING"), str("DESCENDING"));

    let order = seq(str("ORDER BY"), alt(plus(seq(new Field(), opt(ding))), str("PRIMARY KEY"), new Dynamic()));

    let forAll = seq(str("FOR ALL ENTRIES IN"), opt(ver(Version.v740sp05, tok(WAt))), new Source());

    let count = seq(str("COUNT"), alt(tok(ParenLeft), tok(ParenLeftW)), opt(str("DISTINCT")), alt(str("*"), new Field()), str(")"));
    let max = seq(str("MAX"), alt(tok(ParenLeft), tok(ParenLeftW)), new Field(), str(")"));
    let min = seq(str("MIN"), alt(tok(ParenLeft), tok(ParenLeftW)), new Field(), str(")"));
    let sum = seq(str("SUM"), alt(tok(ParenLeft), tok(ParenLeftW)), new Field(), str(")"));
    let avg = seq(str("AVG"), alt(tok(ParenLeft), tok(ParenLeftW)), new Field(), str(")"));

    let fields = alt(str("*"),
                     new Dynamic(),
                     plus(alt(seq(new Field(), opt(ver(Version.v740sp05, str(",")))), count, max, min, sum, avg)));

    let up = seq(str("UP TO"), opt(ver(Version.v740sp05, tok(WAt))), new Source(), str("ROWS"));

    let client = str("CLIENT SPECIFIED");
    let bypass = str("BYPASSING BUFFER");

    let source = seq(from, star(new SQLJoin()), opt(tok(WParenRightW)));

    let group = seq(str("GROUP BY"), plus(alt(new Field(), new Dynamic())));

    let perm = per(source, into, forAll, where, order, up, client, bypass, pack, group, connection);

    let ret = seq(str("SELECT"),
                  alt(str("DISTINCT"), opt(seq(str("SINGLE"), opt(str("FOR UPDATE"))))),
                  fields,
                  perm);

    return ret;
  }
}