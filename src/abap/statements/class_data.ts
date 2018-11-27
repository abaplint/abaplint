import {Statement} from "./_statement";
import {str, seq, IStatementRunnable} from "../combi";
import {DataDefinition} from "../expressions";

export class ClassData extends Statement {

  public getMatcher(): IStatementRunnable {
    return seq(str("CLASS-DATA"), new DataDefinition());
  }

}