import {IStatement} from "./_statement";
import {str, seq, ver} from "../combi";
import {SimpleName, Source, Target} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class ModifyEntities implements IStatement {

  public getMatcher(): IStatementRunnable {
    const s = seq(str("MODIFY ENTITIES OF"), new SimpleName(),
                  str("ENTITY"), new SimpleName(),
                  str("UPDATE SET FIELDS WITH"), new Source(),
                  str("FAILED"), new Target(),
                  str("REPORTED"), new Target());
    return ver(Version.v754, s);
  }

}