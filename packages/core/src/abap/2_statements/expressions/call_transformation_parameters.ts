import {Expression, seq, alt, plus} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Dynamic} from "./dynamic";
import {Field} from "./field";
import {Integer} from "./integer";
import {Source} from "./source";

export class CallTransformationParameters extends Expression {
  public getRunnable(): IStatementRunnable {
    const field = seq(alt(Field, Integer), "=", Source);
    return alt(plus(field), Dynamic);
  }
}