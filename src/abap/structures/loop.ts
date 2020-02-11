import * as Statements from "../statements";
import {IStructure} from "./_structure";
import {star, sta, beginEnd, sub, alt} from "./_combi";
import {Normal, OnChange} from ".";
import {IStructureRunnable} from "./_structure_runnable";

export class Loop implements IStructure {

  public getMatcher(): IStructureRunnable {
    const body = alt(sub(new Normal()), sub(new OnChange()));

    return beginEnd(sta(Statements.Loop),
                    star(body),
                    sta(Statements.EndLoop));
  }

}