import {IStatement} from "./_statement";
import {str, IStatementRunnable} from "../combi";

export class EndDo implements IStatement {

  public getMatcher(): IStatementRunnable {
    return str("ENDDO");
  }

}