import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import {NativeSQL} from "../../2_statements/statements/_statement";
import {star, sta, beginEnd} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";

export class ExecSQL implements IStructure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.ExecSQL),
                    star(sta(NativeSQL)),
                    sta(Statements.EndExec));
  }

}