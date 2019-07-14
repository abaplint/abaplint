import {Statement} from "./_statement";
import {str, seq, IStatementRunnable} from "../combi";
import {InterfaceName} from "../expressions";

export class InterfaceLoad extends Statement {

  public getMatcher(): IStatementRunnable {
    return seq(str("INTERFACE"),
               new InterfaceName(),
               str("LOAD"));
  }

}