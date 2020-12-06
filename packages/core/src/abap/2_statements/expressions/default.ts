import {seq, alt, Expression} from "../combi";
import {Constant, FieldChain} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class Default extends Expression {
  public getRunnable(): IStatementRunnable {

// todo, DEFAULT is only valid for definitions in relation to method parameters
    const def = seq("DEFAULT", alt(Constant, FieldChain));

    return def;
  }
}