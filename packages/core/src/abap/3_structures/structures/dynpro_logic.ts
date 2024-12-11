import {IStructure} from "./_structure";
import * as Statements from "../../2_statements/statements";
import {seq, sta, star} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";

export class DynproLogic implements IStructure {

  public getMatcher(): IStructureRunnable {
    return seq(
      sta(Statements.ProcessBeforeOutput),
      star(sta(Statements.Module)),
      sta(Statements.ProcessAfterInput),
      star(sta(Statements.Module)),
    );
  }

}