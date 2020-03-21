import {IStatement} from "./_statement";
import {str, IStatementRunnable} from "../combi";

export class EndIf implements IStatement {

  public getMatcher(): IStatementRunnable {
    return str("ENDIF");
  }

}