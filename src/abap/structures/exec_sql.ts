import * as Statements from "../statements";
import {Structure} from "./_structure";
import {NativeSQL} from "../statements/_statement";
import {star, sta, beginEnd} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";

export class ExecSQL extends Structure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.ExecSQL),
                    star(sta(NativeSQL)),
                    sta(Statements.EndExec));
  }

}