import {Statement} from "./statement";
import {str, seq, IRunnable} from "../combi";
import {FieldSymbol} from "../expressions";

export class Unassign extends Statement {

  public getMatcher(): IRunnable {
    return seq(str("UNASSIGN"), new FieldSymbol());
  }

}