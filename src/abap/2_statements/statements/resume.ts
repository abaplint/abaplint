import {IStatement} from "./_statement";
import {str, IStatementRunnable} from "../combi";

export class Resume implements IStatement {

  public getMatcher(): IStatementRunnable {
    return str("RESUME");
  }

}