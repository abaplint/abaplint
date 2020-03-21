import {IStatement} from "./_statement";
import {str, IStatementRunnable} from "../combi";

export class EndWhile implements IStatement {

  public getMatcher(): IStatementRunnable {
    return str("ENDWHILE");
  }

}