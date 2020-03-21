import {IStatement} from "./_statement";
import {str, IStatementRunnable} from "../combi";

export class Return implements IStatement {

  public getMatcher(): IStatementRunnable {
    return str("RETURN");
  }

}