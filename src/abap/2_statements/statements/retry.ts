import {IStatement} from "./_statement";
import {str, IStatementRunnable} from "../combi";

export class Retry implements IStatement {

  public getMatcher(): IStatementRunnable {
    return str("RETRY");
  }

}