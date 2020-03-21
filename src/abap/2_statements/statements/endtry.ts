import {IStatement} from "./_statement";
import {str, IStatementRunnable} from "../combi";

export class EndTry implements IStatement {

  public getMatcher(): IStatementRunnable {
    return str("ENDTRY");
  }

}