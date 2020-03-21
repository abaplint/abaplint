import {IStatement} from "./_statement";
import {verNot, str, seq, plus, IStatementRunnable} from "../combi";
import {Field} from "../expressions";
import {Version} from "../../../version";

export class FieldGroup implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("FIELD-GROUPS"),
                    plus(new Field()));

    return verNot(Version.Cloud, ret);
  }

}