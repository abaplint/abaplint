import {Statement} from "./_statement";
import {str, seq, IRunnable} from "../combi";
import {DataDefinition} from "../expressions";

export class ClassData extends Statement {

  public getMatcher(): IRunnable {
    return seq(str("CLASS-DATA"), new DataDefinition());
  }

}