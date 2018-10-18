import * as Statements from "../statements";
import {Structure} from "./_structure";
import {star, IStructureRunnable, sta, beginEnd, sub, alt} from "./_combi";
import {Normal} from "./normal";

export class Form extends Structure {

  public getMatcher(): IStructureRunnable {
    let body = alt(sub(new Normal()),
                   sta(Statements.Ranges),
                   sta(Statements.TypePools),
                   sta(Statements.Tables));

    return beginEnd(sta(Statements.Form),
                    star(body),
                    sta(Statements.Endform));
  }

}