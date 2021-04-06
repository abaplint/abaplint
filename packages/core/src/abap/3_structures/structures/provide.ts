import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import {opt, sta, beginEnd, sub} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";
import {Body} from "./body";

export class Provide implements IStructure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.Provide),
                    opt(sub(Body)),
                    sta(Statements.EndProvide));
  }

}