import {IStatement} from "./_statement";
import {str, IStatementRunnable} from "../combi";

export class Else implements IStatement {

  public getMatcher(): IStatementRunnable {
    return str("ELSE");
  }

}