import {Statement} from "./_statement";
import {str, seq, IRunnable} from "../combi";
import {Field} from "../expressions";

export class InterfaceLoad extends Statement {

  public getMatcher(): IRunnable {
    return seq(str("INTERFACE"),
               new Field(),
               str("LOAD"));
  }

}