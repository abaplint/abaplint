import {seq, per, opt, alt, tok, str, star, plus, Expression, altPrio, optPrio, ver} from "../combi";
import {WParenLeftW, WParenLeft} from "../../1_lexer/tokens";
import {SQLTarget, SQLFieldList, SQLFrom, Field, Dynamic, SQLCond, SQLSource, DatabaseConnection} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

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

    const where = seq(str("WHERE"), new SQLCond());

    const ding = alt(str("ASCENDING"), str("DESCENDING"));

    const ofields = plus(seq(new Field(), opt(ding), opt(str(","))));
    const order = seq(str("ORDER BY"), altPrio(str("PRIMARY KEY"), new Dynamic(), ofields));

    const forAll = seq(str("FOR ALL ENTRIES IN"), new SQLSource());

    const up = seq(str("UP TO"), new SQLSource(), str("ROWS"));
    const offset = ver(Version.v751, seq(str("OFFSET"), new SQLSource()));

    const client = str("CLIENT SPECIFIED");
    const bypass = str("BYPASSING BUFFER");

    const group = seq(str("GROUP BY"), plus(seq(alt(new Field(), new Dynamic()), opt(str(",")))));

    const fields = seq(str("FIELDS"), new SQLFieldList());

    const perm = per(new SQLFrom(), into, forAll, where, order, up, offset, client, bypass, group, fields, new DatabaseConnection());

    const ret = seq(str("SELECT"),
                    altPrio(str("DISTINCT"), optPrio(seq(str("SINGLE"), optPrio(str("FOR UPDATE"))))),
                    opt(new SQLFieldList()),
                    perm);

    return ret;
  }
}