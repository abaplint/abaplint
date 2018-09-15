import {Statement} from "./statement";
import {verNot, str, seq, plus, IRunnable} from "../combi";
import {Field} from "../expressions";
import {Version} from "../version";

export class FieldGroup extends Statement {

  public static get_matcher(): IRunnable {
    let ret = seq(str("FIELD-GROUPS"),
                  plus(new Field()));

    return verNot(Version.Cloud, ret);
  }

}