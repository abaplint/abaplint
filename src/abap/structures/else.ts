import {Structure} from "./_structure";
import {IStructureRunnable, opt, seq, sta, sub} from "./_combi";
import * as Statements from "../statements";
import {Body} from "./body";

export class Else extends Structure {

  public getMatcher(): IStructureRunnable {
    const body = opt(sub(new Body()));
    const elseif = seq(sta(Statements.Else), body);
    return elseif;
  }

}