import * as Statements from "../statements";
import {Structure} from "./_structure";
import {star, sta, beginEnd, sub, alt} from "./_combi";
import {Normal} from "./normal";
import {IStructureRunnable} from "./_structure_runnable";

export class Form extends Structure {

  public getMatcher(): IStructureRunnable {
    const body = alt(sub(new Normal()),
                     sta(Statements.Ranges),
                     sta(Statements.TypePools),
                     sta(Statements.Tables));

    return beginEnd(sta(Statements.Form),
                    star(body),
                    sta(Statements.EndForm));
  }

}