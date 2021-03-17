import {altPrio, regex as reg, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Dynamic} from "./dynamic";

export class DatabaseTable extends Expression {
  public getRunnable(): IStatementRunnable {
    return altPrio(Dynamic, reg(/^\*?(\/\w+\/)?\w+$/));
  }
}