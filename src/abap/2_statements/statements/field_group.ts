import {Statement} from "./_statement";
import {verNot, str, seq, plus, IStatementRunnable} from "../combi";
import {Field} from "../expressions";
import {Version} from "../../../version";

export class FieldGroup extends Statement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("FIELD-GROUPS"),
                    plus(new Field()));

    return verNot(Version.Cloud, ret);
  }

}