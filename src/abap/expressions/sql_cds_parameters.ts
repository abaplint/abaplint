import {tok, alt, str, seq, star, Expression, IRunnable} from "../combi";
import {Field} from ".";
import {WAt} from "../tokens/";
import {Constant} from "./constant";

export class SQLCDSParameters extends Expression {
  public getRunnable(): IRunnable {
    const param = seq(new Field(), str("="), alt(seq(tok(WAt), new Field()), new Constant()));
    return seq(str("("), param, star(seq(str(","), param)), str(")"));
  }
}