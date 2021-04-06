import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import {opt, sta, beginEnd, sub} from "./_combi";
import {Body} from "./body";
import {IStructureRunnable} from "./_structure_runnable";

export class Select implements IStructure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.SelectLoop),
                    opt(sub(Body)),
                    sta(Statements.EndSelect));
  }

}