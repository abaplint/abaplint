import {IStatement} from "./_statement";
import {str, IStatementRunnable} from "../combi";

export class EndLoop implements IStatement {

  public getMatcher(): IStatementRunnable {
    return str("ENDLOOP");
  }

}