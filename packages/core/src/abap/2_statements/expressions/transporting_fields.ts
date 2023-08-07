import {seq, plus, failStar, alt, altPrio, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Dynamic} from "./dynamic";
import {FieldSub} from "./field_sub";

export class TransportingFields extends Expression {
  public getRunnable(): IStatementRunnable {
    const fields = plus(alt(seq("INTO", failStar()), FieldSub));
    return altPrio(Dynamic, fields);
  }
}