import {IStatement} from "./_statement";
import {str, IStatementRunnable} from "../combi";

export class EndForm implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = str("ENDFORM");

    return ret;
  }

}