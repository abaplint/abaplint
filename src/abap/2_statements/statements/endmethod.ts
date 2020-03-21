import {IStatement} from "./_statement";
import {str, IStatementRunnable} from "../combi";

export class EndMethod implements IStatement {

  public getMatcher(): IStatementRunnable {
    return str("ENDMETHOD");
  }

}