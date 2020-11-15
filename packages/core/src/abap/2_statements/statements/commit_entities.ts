import {IStatement} from "./_statement";
import {str, seq, ver} from "../combi";
import {SimpleName, Target} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class CommitEntities implements IStatement {

  public getMatcher(): IStatementRunnable {
    const s = seq(str("COMMIT ENTITIES RESPONSE OF"), new SimpleName(),
                  str("FAILED"), new Target(),
                  str("REPORTED"), new Target());
    return ver(Version.v754, s);
  }

}