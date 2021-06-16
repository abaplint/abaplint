import {Expression, seq, optPrio, plus} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {ClassName} from "./class_name";

export class ClassFriends extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(optPrio("GLOBAL"), "FRIENDS", plus(ClassName));
  }
}