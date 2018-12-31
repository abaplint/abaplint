import {Statement} from "./_statement";
import {str, seq, opt, IStatementRunnable} from "../combi";
import {ClassName} from "../expressions";

export class Interface extends Statement {

  public getMatcher(): IStatementRunnable {
    return seq(str("INTERFACE"),
               new ClassName(),
               opt(str("PUBLIC")));
  }

}