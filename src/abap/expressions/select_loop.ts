import {seq, per, opt, alt, tok, str, ver, star, plus, Expression, IRunnable} from "../combi";
import {WParenLeftW, WAt, WParenRightW, WParenLeft} from "../tokens/";
import {Field, DatabaseTable, Dynamic, Target, Source, SQLCond, SQLJoin, SQLFieldName, SQLTarget, SQLAggregation} from "./";
import {Version} from "../../version";
import {SQLSource} from "./sql_source";

export class SelectLoop extends Expression {
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

    let into = seq(str("INTO"), alt(intoList, intoSimple));

    let where = seq(str("WHERE"), new SQLCond());

    let ding = alt(str("ASCENDING"), str("DESCENDING"));

    let order = seq(str("ORDER BY"), alt(plus(seq(new SQLFieldName(), opt(ding))), str("PRIMARY KEY"), new Dynamic()));

    let comma = opt(ver(Version.v740sp05, str(",")));
    let someField = seq(alt(new SQLFieldName(), new SQLAggregation()), comma);
    let fieldList = seq(star(someField), new SQLFieldName(), comma, star(someField));

// todo, use SQLFieldList instead
    let fields = alt(str("*"),
                     new Dynamic(),
                     fieldList);

    let client = str("CLIENT SPECIFIED");
    let bypass = str("BYPASSING BUFFER");

    let up = seq(str("UP TO"), new SQLSource(), str("ROWS"));

    let pack = seq(str("PACKAGE SIZE"), new Source());

    let forAll = seq(str("FOR ALL ENTRIES IN"), new SQLSource());

    let source = seq(from, star(new SQLJoin()), opt(tok(WParenRightW)));

    let group = seq(str("GROUP BY"), plus(alt(new SQLFieldName(), new Dynamic())));

    let from2 = seq(str("FROM"), new DatabaseTable());

// hmm, this is bad, PACKAGE SIZE is not part of the non-loop?
    let appending = seq(str("APPENDING"),
                        opt(str("CORRESPONDING FIELDS OF")),
                        str("TABLE"),
                        new SQLTarget(),
                        alt(seq(from2, pack), seq(pack, from2)));

    let intoTab = seq(str("INTO"), opt(str("CORRESPONDING FIELDS OF")), str("TABLE"), new SQLTarget(), pack);

    let perm = per(source, where, up, order, client, bypass, group, forAll, alt(appending, intoTab, into));

    let ret = seq(str("SELECT"),
                  fields,
                  perm);

    return ret;
  }
}