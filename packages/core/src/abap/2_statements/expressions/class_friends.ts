import {Expression, seq, opt, pluss} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {ClassName} from "./class_name";

export class ClassFriends extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(opt("GLOBAL"), "FRIENDS", pluss(ClassName));
  }
}