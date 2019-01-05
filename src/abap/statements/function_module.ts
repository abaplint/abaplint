import {Statement} from "./_statement";
import {str, seq, IStatementRunnable} from "../combi";
import {FunctionName} from "../expressions";

export class FunctionModule extends Statement {

  public getMatcher(): IStatementRunnable {
    return seq(str("FUNCTION"), new FunctionName());
  }

}