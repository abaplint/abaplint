import {IStatement} from "./_statement";
import {str, seq, IStatementRunnable} from "../combi";
import {Field} from "../expressions";

export class FunctionModule implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq(str("FUNCTION"), new Field());
  }

}