import {Registry} from "../registry";
import {Version} from "../version";
import {Unknown, Comment, Empty} from "../abap/2_statements/statements/_statement";
import * as Statements from "../abap/2_statements/statements";
import {MethodLengthStats} from "./method_length_stats";
import {Config} from "../config";
import {IRegistry} from "../_iregistry";
import {ABAPFile} from "../abap/abap_file";
import {getABAPObjects} from "../get_abap";

export interface ITotals {
  statements: number;
  tokens: number;
  files: number;
  objects: number;
}

export interface ITypeCount {
  type: string;
  count: number;
}

export interface IObjectOrientation {
  oo: number;
  non: number;
}

export interface IResult {
  version: string;
  target: string;
  time: string;
  totals: ITotals;
  objects: ITypeCount[];
  statements: ITypeCount[];
  objectOrientation: IObjectOrientation;
  methodLength: number[];
}

export class Stats {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  public run(): IResult {
    return {
      version: Registry.abaplintVersion(),
      target: this.reg.getConfig().getVersion(),
      time: new Date().toISOString(),
      totals: this.buildTotals(),
      objects: this.sort(this.buildObjects()),
      objectOrientation: this.buildObjectOrientation(),
      methodLength: this.buildMethodLength(),
      statements: this.buildStatements(), // attention: this changes the ABAP version
    };
  }

// ////////////////////////////////////////////////

  private sort(input: ITypeCount[]): ITypeCount[] {
    return input.sort((a, b) => { return a.type.localeCompare(b.type); });
  }

  private buildMethodLength(): number[] {
    const ret: number[] = [];

    for (const obj of this.reg.getObjects()) {
      const stats = MethodLengthStats.run(obj);
      for (const s of stats) {
// add to output, todo, this is really slow
        for (let i = 0; i <= s.count; i++) {
          if (ret[i] === undefined) {
            ret.push(0);
          }
        }
        ret[s.count] = ret[s.count] + 1;
      }
    }
    return ret;
  }

  private findFiles(): ABAPFile[] {
    const ret: ABAPFile[] = [];
    const obj = getABAPObjects(this.reg);
    for (const o of obj) {
      for (const file of o.getABAPFiles()) {
        ret.push(file);
      }
    }
    return ret;
  }

  private buildObjectOrientation(): IObjectOrientation {
    const res: IObjectOrientation = {oo: 0, non: 0};
    let oo: boolean = false;

    for (const file of this.findFiles()) {
      for (const stat of file.getStatements()) {
        const type = stat.get();
        if (type instanceof Comment
            || type instanceof Empty) {
          continue;
        } else if (type instanceof Statements.ClassDefinition
            || type instanceof Statements.ClassImplementation
            || type instanceof Statements.Interface) {
          oo = true;
          res.oo = res.oo + 1;
        } else if (type instanceof Statements.EndClass
            || type instanceof Statements.EndInterface) {
          oo = false;
          res.oo = res.oo + 1;
        } else if (type instanceof Statements.ClassDefinitionLoad
            || type instanceof Statements.ClassOther
            || type instanceof Statements.InterfaceDeferred) {
          res.oo = res.oo + 1;
        } else if (oo) {
          res.oo = res.oo + 1;
        } else {
          res.non = res.non + 1;
        }
      }
    }

    return res;
  }

  private buildStatements(): ITypeCount[] {
    const ret: ITypeCount[] = [];
    for (const ver of Object.values(Version)) {
      ret.push({type: ver, count: this.statementsVersion(ver)});
    }
    return ret;
  }

  private statementsVersion(ver: Version): number {
    let result = 0;

    this.reg.setConfig(Config.getDefault(ver));
    this.reg.parse();

    for (const file of this.findFiles()) {
      for (const stat of file.getStatements()) {
        if (!(stat.get() instanceof Unknown)) {
          result = result + 1;
        }
      }
    }

    return result;
  }

  private buildObjects(): ITypeCount[] {
    const res: ITypeCount[] = [];
    for (const obj of this.reg.getObjects()) {
      let found = false;
      for (const r of res) {
        if (r.type === obj.getType()) {
          r.count = r.count + 1;
          found = true;
        }
      }
      if (found === false) {
        res.push({type: obj.getType(), count: 1});
      }
    }
    return res;
  }

  private buildTotals(): ITotals {
    return {
      objects: this.reg.getObjects().length,
      files: this.countFiles(),
      statements: this.countStatements(),
      tokens: this.countTokens(),
    };
  }

  private countStatements(): number {
    let result = 0;
    for (const file of this.findFiles()) {
      result = result + file.getStatements().length;
    }
    return result;
  }

  private countTokens(): number {
    let result = 0;
    for (const file of this.findFiles()) {
      result = result + file.getTokens().length;
    }
    return result;
  }

  private countFiles(): number {
    let result = 0;
    for (const obj of this.reg.getObjects()) {
      result = result + obj.getFiles().length;
    }
    return result;
  }
}