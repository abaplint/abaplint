import {IStatement} from "./_statement";
import {str, IStatementRunnable} from "../combi";

export class Public implements IStatement {

  public getMatcher(): IStatementRunnable {
    return str("PUBLIC SECTION");
  }

}