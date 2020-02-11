import {Structure} from "./_structure";
import {opt, seq, sta, sub} from "./_combi";
import * as Statements from "../statements";
import {Body} from "./body";
import {IStructureRunnable} from "./_structure_runnable";

export class ElseIf extends Structure {

  public getMatcher(): IStructureRunnable {
    const body = opt(sub(new Body()));
    const elseif = seq(sta(Statements.ElseIf), body);
    return elseif;
  }

}