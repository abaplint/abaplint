import {Registry} from "../registry";


export interface IStatementTypeCount {
  type: string;
  count: number;
}

export class StatementTypesStats {

  public static run(reg: Registry): IStatementTypeCount[] {
    const ret: IStatementTypeCount[] = [];

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