import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, plus, IRunnable} from "../combi";

export class FieldGroup extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("FIELD-GROUPS"),
               plus(new Reuse.Field()));
  }

}