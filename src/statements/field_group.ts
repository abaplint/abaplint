import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let plus = Combi.plus;

export class FieldGroup extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("FIELD-GROUPS"),
               plus(new Reuse.Field()));
  }

}