import {IStructure} from "./_structure";
import * as Statements from "../../2_statements/statements";
import {alt, seq, sta, star} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";

export class DynproLogic implements IStructure {

  public getMatcher(): IStructureRunnable {
    const pai = star(sta(Statements.Module));
    const pbo = star(alt(sta(Statements.Module), sta(Statements.Field)));

    return seq(
      sta(Statements.ProcessBeforeOutput),
      pbo,
      sta(Statements.ProcessAfterInput),
      pai,
    );
  }

}