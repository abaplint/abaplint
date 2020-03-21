import {IStatement} from "./_statement";
import {str, seq, opt, IStatementRunnable} from "../combi";
import {Global, InterfaceName} from "../expressions";

export class Interface implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq(str("INTERFACE"),
               new InterfaceName(),
               opt(new Global()));
  }

}