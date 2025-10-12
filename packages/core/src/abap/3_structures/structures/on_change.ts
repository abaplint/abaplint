import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import {opt, sta, beginEnd, sub, seq} from "./_combi";
import {Body} from "./body";
import {IStructureRunnable} from "./_structure_runnable";
import {Else} from "./else";

export class OnChange implements IStructure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.OnChange),
                    seq(opt(sub(Body)), opt(sub(Else))),
                    sta(Statements.EndOn));
  }

}