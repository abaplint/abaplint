import {IStatement} from "./_statement";
import {str, seq, IStatementRunnable} from "../combi";
import {TargetFieldSymbol} from "../expressions";

export class Unassign implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq(str("UNASSIGN"), new TargetFieldSymbol());
  }

}