import {alt, str, plus, seq, opt, ver, tok, Expression, IStatementRunnable} from "../combi";
import {Dynamic, Field, SQLAggregation} from ".";
import {Version} from "../../version";
import {WAt} from "../tokens/";
import {Constant} from "./constant";

export class SQLFieldList extends Expression {
  public getRunnable(): IStatementRunnable {
    const comma = opt(ver(Version.v740sp05, str(",")));

    const abap = ver(Version.v740sp05, seq(tok(WAt), new Field()));

    return alt(str("*"),
               new Dynamic(),
               plus(alt(seq(alt(new Field(), abap, new Constant()), comma), new SQLAggregation())));
  }
}