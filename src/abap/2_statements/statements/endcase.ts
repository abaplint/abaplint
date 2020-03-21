import {IStatement} from "./_statement";
import {str, IStatementRunnable} from "../combi";

export class EndCase implements IStatement {

  public getMatcher(): IStatementRunnable {
    return str("ENDCASE");
  }

}