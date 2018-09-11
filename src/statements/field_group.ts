import {Statement} from "./statement";
import {str, seq, plus, IRunnable} from "../combi";
import {Field} from "../expressions";

export class FieldGroup extends Statement {

  public static get_matcher(): IRunnable {
    return seq(str("FIELD-GROUPS"),
               plus(new Field()));
  }

}