import {Statement} from "./_statement";
import {str, seq, IStatementRunnable} from "../combi";
import {DataDefinition} from "../expressions";

export class Data extends Statement {

  public getMatcher(): IStatementRunnable {
    return seq(str("DATA"), new DataDefinition());
  }

}