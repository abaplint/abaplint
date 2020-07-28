import {seq, per, opt, alt, tok, str, star, Expression, altPrio, optPrio, ver} from "../combi";
import {WParenLeftW, WParenLeft} from "../../1_lexer/tokens";
import {SQLTarget, SQLFieldList, SQLFrom, SQLCond, SQLSource, DatabaseConnection, SQLTargetTable, SQLOrderBy, SQLHaving} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {SQLGroupBy} from "./sql_group_by";

export class Select extends Expression {
  public getRunnable(): IStatementRunnable {

    const intoList = seq(alt(tok(WParenLeft), tok(WParenLeftW)),
                         star(seq(new SQLTarget(), str(","))),
                         new SQLTarget(),
                         str(")"));
    const intoSimple = seq(opt(str("CORRESPONDING FIELDS OF")),
                           new SQLTarget());

    const into = alt(seq(str("INTO"), alt(intoList, intoSimple)), new SQLTargetTable());

    const where = seq(str("WHERE"), new SQLCond());

    const forAll = seq(str("FOR ALL ENTRIES IN"), new SQLSource());

    const up = seq(str("UP TO"), new SQLSource(), str("ROWS"));
    const offset = ver(Version.v751, seq(str("OFFSET"), new SQLSource()));

    const client = str("CLIENT SPECIFIED");
    const bypass = str("BYPASSING BUFFER");

    const fields = seq(str("FIELDS"), new SQLFieldList());

    const perm = per(new SQLFrom(), into, forAll, where,
                     new SQLOrderBy(), up, offset, client, new SQLHaving(), bypass, new SQLGroupBy(), fields, new DatabaseConnection());

    const ret = seq(str("SELECT"),
                    altPrio(str("DISTINCT"), optPrio(seq(str("SINGLE"), optPrio(str("FOR UPDATE"))))),
                    opt(new SQLFieldList()),
                    perm);

    return ret;
  }
}