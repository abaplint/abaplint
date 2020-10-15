import {str, Expression, seq, opt, plus} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {ClassName} from "./class_name";

export class ClassFriends extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(opt(str("GLOBAL")), str("FRIENDS"), plus(new ClassName()));
  }
}