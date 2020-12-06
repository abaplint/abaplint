import {IStatement} from "./_statement";
import {seqs, pluss} from "../combi";
import {ClassName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ClassLocalFriends implements IStatement {

  public getMatcher(): IStatementRunnable {

    const local = seqs("LOCAL FRIENDS", pluss(ClassName));

    return seqs("CLASS", ClassName, "DEFINITION", local);
  }

}