import {IStatement} from "./_statement";
import {str, IStatementRunnable} from "../combi";

export class EndTestSeam implements IStatement {

  public getMatcher(): IStatementRunnable {
    return str("END-TEST-SEAM");
  }

}