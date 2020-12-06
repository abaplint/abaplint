import {str, Expression, seqs, opts, plus} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {ClassName} from "./class_name";

export class ClassFriends extends Expression {
  public getRunnable(): IStatementRunnable {
    return seqs(opts("GLOBAL"), str("FRIENDS"), plus(new ClassName()));
  }
}