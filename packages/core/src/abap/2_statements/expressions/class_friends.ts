import {Expression, seqs, opts, pluss} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {ClassName} from "./class_name";

export class ClassFriends extends Expression {
  public getRunnable(): IStatementRunnable {
    return seqs(opts("GLOBAL"), "FRIENDS", pluss(ClassName));
  }
}