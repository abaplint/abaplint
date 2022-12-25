import {IStatement} from "./_statement";
import {seq, plusPrio} from "../combi";
import {ClassName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ClassLocalFriends implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq("CLASS", ClassName, "DEFINITION LOCAL FRIENDS", plusPrio(ClassName));
  }

}