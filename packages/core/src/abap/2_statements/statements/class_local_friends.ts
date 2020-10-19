import {IStatement} from "./_statement";
import {str, seq, plus} from "../combi";
import {ClassName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ClassLocalFriends implements IStatement {

  public getMatcher(): IStatementRunnable {

    const local = seq(str("LOCAL FRIENDS"), plus(new ClassName()));

    return seq(str("CLASS"), new ClassName(), str("DEFINITION"), local);
  }

}