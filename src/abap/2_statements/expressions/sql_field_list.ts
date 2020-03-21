import {alt, str, plus, seq, opt, ver, tok, Expression, IStatementRunnable, optPrio} from "../combi";
import {Constant, SQLFieldName, Dynamic, Field, SQLAggregation} from ".";
import {Version} from "../../../version";
import {WAt} from "../../1_lexer/tokens";

export class SQLFieldList extends Expression {
  public getRunnable(): IStatementRunnable {
    const comma = opt(ver(Version.v740sp05, str(",")));

    const abap = ver(Version.v740sp05, seq(tok(WAt), new Field()));

    const as = seq(str("AS"), new Field());

    return alt(str("*"),
               new Dynamic(),
               plus(alt(seq(alt(new SQLFieldName(), abap, new Constant()), optPrio(as), comma), new SQLAggregation())));
  }
}