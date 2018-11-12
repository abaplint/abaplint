import {alt, str, plus, seq, opt, ver, tok, Expression, IRunnable} from "../combi";
import {Dynamic, Field, SQLAggregation} from ".";
import {Version} from "../../version";
import {WAt} from "../tokens/";

export class SQLFieldList extends Expression {
  public getRunnable(): IRunnable {
    let comma = opt(ver(Version.v740sp05, str(",")));
    let at = ver(Version.v740sp05, tok(WAt));

    let abap = ver(Version.v740sp05, seq(at, new Field()));

    return alt(str("*"),
               new Dynamic(),
               plus(alt(seq(alt(new Field(), abap), comma), new SQLAggregation())));
  }
}