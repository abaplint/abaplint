import {alt, str, plus, seq, opt, ver, Expression, IRunnable} from "../combi";
import {Dynamic, Field, SQLAggregation} from ".";
import {Version} from "../../version";

export class SQLFieldList extends Expression {
  public getRunnable(): IRunnable {
    return alt(str("*"),
               new Dynamic(),
               plus(alt(seq(new Field(), opt(ver(Version.v740sp05, str(",")))), new SQLAggregation())));
  }
}