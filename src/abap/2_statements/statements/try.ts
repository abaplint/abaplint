import {IStatement} from "./_statement";
import {str, IStatementRunnable} from "../combi";

export class Try implements IStatement {

  public getMatcher(): IStatementRunnable {
    return str("TRY");
  }

}