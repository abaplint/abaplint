import {IStructure} from "./_structure";
import {opt, seq, sta, sub} from "./_combi";
import * as Statements from "../../2_statements/statements";
import {Body} from "./body";
import {IStructureRunnable} from "./_structure_runnable";

export class ElseIf implements IStructure {

  public getMatcher(): IStructureRunnable {
    const body = opt(sub(Body));
    const elseif = seq(sta(Statements.ElseIf), body);
    return elseif;
  }

}