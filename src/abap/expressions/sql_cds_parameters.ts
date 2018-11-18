import {tok, str, seq, star, Expression, IRunnable} from "../combi";
import {Field} from ".";
import {WAt} from "../tokens/";

export class SQLCDSParameters extends Expression {
  public getRunnable(): IRunnable {
    const param = seq(new Field(), str("="), tok(WAt), new Field());
    return seq(str("("), param, star(seq(str(","), param)), str(")"));
  }
}