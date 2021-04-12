import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import {star, sta, beginEnd, sub, alt} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";
import {Body, OnChange} from ".";

export class Loop implements IStructure {

  public getMatcher(): IStructureRunnable {
    const body = alt(sub(Body), sub(OnChange));

    return beginEnd(sta(Statements.Loop),
                    star(body),
                    sta(Statements.EndLoop));
  }

}