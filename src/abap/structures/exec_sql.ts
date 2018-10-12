import * as Statements from "../statements";
import {Structure} from "./_structure";
import {NativeSQL} from "../statements/statement";
import {star, IStructureRunnable, sta, beginEnd} from "./_combi";

export class ExecSQL extends Structure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.ExecSQL),
                    star(sta(NativeSQL)),
                    sta(Statements.EndExec));
  }

}