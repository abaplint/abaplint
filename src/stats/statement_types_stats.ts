import {Registry} from "../registry";
import {ITypeCount} from "./stats";

export class StatementTypesStats {

  public static run(reg: Registry): ITypeCount[] {
    const ret: ITypeCount[] = [];

    for (const a of reg.getABAPFiles()) {
      for (const s of a.getStatements()) {
        let added = false;
// todo, this is slow
        for (const r of ret) {
          if (r.type === s.get().constructor.name) {
            r.count++;
            added = true;
            break;
          }
        }
        if (added === false) {
          ret.push({type: s.get().constructor.name, count: 1});
        }
      }
    }

    return ret;
  }

}