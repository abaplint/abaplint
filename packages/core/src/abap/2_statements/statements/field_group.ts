import {IStatement} from "./_statement";
import {verNot, seqs, plus} from "../combi";
import {Field} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class FieldGroup implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seqs("FIELD-GROUPS", plus(new Field()));

    return verNot(Version.Cloud, ret);
  }

}