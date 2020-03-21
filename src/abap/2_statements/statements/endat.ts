import {IStatement} from "./_statement";
import {str, IStatementRunnable} from "../combi";

export class EndAt implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = str("ENDAT");
    return ret;
  }

}