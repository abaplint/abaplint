import {Statement} from "./_statement";
import {str, seq, opt, IStatementRunnable} from "../combi";
import {Global, InterfaceName} from "../expressions";

export class Interface extends Statement {

  public getMatcher(): IStatementRunnable {
    return seq(str("INTERFACE"),
               new InterfaceName(),
               opt(new Global()));
  }

}