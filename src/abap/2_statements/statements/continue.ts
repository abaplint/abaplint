import {IStatement} from "./_statement";
import {str, IStatementRunnable} from "../combi";

export class Continue implements IStatement {

  public getMatcher(): IStatementRunnable {
    return str("CONTINUE");
  }

}