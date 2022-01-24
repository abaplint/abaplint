import {SimpleSource3} from ".";
import {Expression, seq, alt, plus} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Dynamic} from "./dynamic";
import {Field} from "./field";
import {Integer} from "./integer";

export class CallTransformationParameters extends Expression {
  public getRunnable(): IStatementRunnable {
    const field = seq(alt(Field, Integer), "=", SimpleSource3);
    return alt(plus(field), Dynamic);
  }
}