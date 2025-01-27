import {IStructure} from "./_structure";
import * as Statements from "../../2_statements/statements";
import {alt, seq, sta, star} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";

export class ProcessBeforeOutput implements IStructure {

  public getMatcher(): IStructureRunnable {
    const pbo = star(alt(sta(Statements.Module), sta(Statements.Field), sta(Statements.CallSubscreen)));

    return seq(sta(Statements.ProcessBeforeOutput), pbo);
  }

}