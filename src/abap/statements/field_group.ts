import {Statement} from "./_statement";
import {verNot, str, seq, plus, IRunnable} from "../combi";
import {Field} from "../expressions";
import {Version} from "../../version";

export class FieldGroup extends Statement {

  public getMatcher(): IRunnable {
    const ret = seq(str("FIELD-GROUPS"),
                    plus(new Field()));

    return verNot(Version.Cloud, ret);
  }

}