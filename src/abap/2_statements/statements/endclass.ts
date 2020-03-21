import {IStatement} from "./_statement";
import {str, IStatementRunnable} from "../combi";

export class EndClass implements IStatement {

  public getMatcher(): IStatementRunnable {
    return str("ENDCLASS");
  }

}