import {seq, per, opt, alt, tok, str, ver, star, plus, Expression, IRunnable, regex} from "../combi";
import {WParenLeftW, WAt, WParenRightW, WParenLeft} from "../tokens/";
import {Field, DatabaseTable, Dynamic, Target, SQLCond, SQLJoin} from "./";
import {Version} from "../../version";

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

    let order = seq(str("ORDER BY"), alt(plus(seq(new Field(), opt(ding))), str("PRIMARY KEY"), new Dynamic()));

    let name = regex(/^(?!(?:SINGLE|INTO)$)\w+$/i);

    let fields = alt(str("*"),
                     new Dynamic(),
                     plus(seq(name, opt(ver(Version.v740sp05, str(","))))));

    let client = str("CLIENT SPECIFIED");
    let bypass = str("BYPASSING BUFFER");

    let source = seq(from, star(new SQLJoin()), opt(tok(WParenRightW)));

    let group = seq(str("GROUP BY"), plus(alt(new Field(), new Dynamic())));

    let perm = per(source, into, where, order, client, bypass, group);

    let ret = seq(str("SELECT"),
                  fields,
                  perm);

    return ret;
  }
}