import * as Statements from "../statements";
import {IStructure} from "./_structure";
import {star, sta, beginEnd, sub, alt} from "./_combi";
import {Normal} from "./normal";
import {IStructureRunnable} from "./_structure_runnable";

export class Module implements IStructure {

  public getMatcher(): IStructureRunnable {
    const body = alt(sub(new Normal()),
                     sta(Statements.Ranges),
                     sta(Statements.Tables));

    return beginEnd(sta(Statements.Module),
                    star(body),
                    sta(Statements.EndModule));
  }

}