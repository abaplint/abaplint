import {IStatement} from "./_statement";
import {str} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class EndForm implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = str("ENDFORM");

    return ret;
  }

}