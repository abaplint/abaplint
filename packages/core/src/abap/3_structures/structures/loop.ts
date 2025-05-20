import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import {star, sta, beginEnd, sub, alt} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";
import {Body, Chain} from ".";

export class Loop implements IStructure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.Loop),
                    alt(sub(Chain), star(sub(Body))),
                    sta(Statements.EndLoop));
  }

}