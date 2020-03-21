import {IStatement} from "./_statement";
import {str, seq, IStatementRunnable} from "../combi";
import {Cond} from "../expressions";

export class If implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq(str("IF"), new Cond());
  }

}