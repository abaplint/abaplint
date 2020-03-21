import {Statement} from "./_statement";
import {str, IStatementRunnable} from "../combi";

export class EndForm extends Statement {

  public getMatcher(): IStatementRunnable {
    const ret = str("ENDFORM");

    return ret;
  }

}