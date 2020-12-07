import {IStatement} from "./_statement";
import {seq, plus} from "../combi";
import {ClassName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ClassLocalFriends implements IStatement {

  public getMatcher(): IStatementRunnable {

    const local = seq("LOCAL FRIENDS", plus(ClassName));

    return seq("CLASS", ClassName, "DEFINITION", local);
  }

}