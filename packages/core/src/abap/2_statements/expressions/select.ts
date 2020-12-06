import {seqs, pers, opts, alts, tok, str, stars, Expression, altPrios, optPrios, vers} from "../combi";
import {WParenLeftW, WParenLeft} from "../../1_lexer/tokens";
import {SQLTarget, SQLFieldList, SQLFrom, SQLCond, SQLSource, DatabaseConnection, SQLTargetTable, SQLOrderBy, SQLHaving, SQLForAllEntries} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {SQLGroupBy} from "./sql_group_by";

export class Select extends Expression {
  public getRunnable(): IStatementRunnable {

    const intoList = seqs(alts(tok(WParenLeft), tok(WParenLeftW)),
                          stars(seqs(SQLTarget, ",")),
                          SQLTarget,
                          ")");
    const intoSimple = seqs(opts("CORRESPONDING FIELDS OF"),
                            SQLTarget);

    const into = alts(seqs("INTO", alts(intoList, intoSimple)), SQLTargetTable);

    const where = seqs("WHERE", SQLCond);

    const up = seqs("UP TO", SQLSource, "ROWS");
    const offset = vers(Version.v751, seqs("OFFSET", SQLSource));

    const client = str("CLIENT SPECIFIED");
    const bypass = str("BYPASSING BUFFER");

    const fields = seqs("FIELDS", SQLFieldList);

    const perm = pers(SQLFrom, into, SQLForAllEntries, where,
                      SQLOrderBy, up, offset, client, SQLHaving, bypass, SQLGroupBy, fields, DatabaseConnection);

    const ret = seqs("SELECT",
                     altPrios("DISTINCT", optPrios(seqs("SINGLE", optPrios("FOR UPDATE")))),
                     opts(SQLFieldList),
                     perm);

    return ret;
  }
}