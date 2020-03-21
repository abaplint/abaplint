import {IStatement} from "./_statement";
import {str, IStatementRunnable} from "../combi";

export class EndTestInjection implements IStatement {

  public getMatcher(): IStatementRunnable {
    return str("END-TEST-INJECTION");
  }

}