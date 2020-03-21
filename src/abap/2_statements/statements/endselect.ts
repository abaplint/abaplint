import {IStatement} from "./_statement";
import {str, IStatementRunnable} from "../combi";

export class EndSelect implements IStatement {

  public getMatcher(): IStatementRunnable {
    return str("ENDSELECT");
  }

}