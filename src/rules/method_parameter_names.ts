import {Issue} from "../issue";
import {IRule} from "./_irule";
import {IObject} from "../objects/_iobject";
import {MethodDefinition} from "../abap/types/method_definition";
import {MethodParameter} from "../abap/types/method_parameter";
import {Registry} from "../registry";
import {ABAPObject} from "../objects/_abap_object";
import {IFile} from "../files/_ifile";

export class MethodParameterNamesConf {
  public enabled: boolean = true;
  public ignoreExceptions: boolean = true;
  public importing: string = "^I._.*$";
  public returning: string = "^R._.*$";
  public changing: string = "^C._.*$";
  public exporting: string = "^E._.*$";
  public ignoreNames: string[] = ["P_TASK"];
}

export class MethodParameterNames implements IRule {

  private conf = new MethodParameterNamesConf();

  public getKey(): string {
    return "method_parameter_names";
  }

  public getDescription(): string {
    return "Method Parameter Names";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: MethodParameterNamesConf) {
    this.conf = conf;
  }

  public run(obj: IObject, _reg: Registry): Issue[] {
    let ret: Issue[] = [];

    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    for (const file of obj.getParsedFiles()) {
      for (const def of file.getInterfaceDefinitions()) {
        for (const method of def.getMethodDefinitions()) {
          ret = ret.concat(this.checkMethod(method, file));
        }
      }
      for (const def of file.getClassDefinitions()) {
        if (this.conf.ignoreExceptions && def.isException()) {
          continue;
        }
        const definitions = def.getMethodDefinitions();
        if (definitions === undefined) {
          continue;
        }
        for (const method of definitions.getAll()) {
          ret = ret.concat(this.checkMethod(method, file));
        }
      }
    }

    return ret;
  }

  private checkMethod(method: MethodDefinition, file: IFile): Issue[] {
    let ret: Issue[] = [];

    const parameters = method.getParameters();
    for (const param of parameters.getImporting()) {
      ret = ret.concat(this.checkParameter(param, this.conf.importing, file));
    }
    for (const param of parameters.getExporting()) {
      ret = ret.concat(this.checkParameter(param, this.conf.exporting, file));
    }
    for (const param of parameters.getChanging()) {
      ret = ret.concat(this.checkParameter(param, this.conf.changing, file));
    }
    const returning = parameters.getReturning();
    if (returning) {
      ret = ret.concat(this.checkParameter(returning, this.conf.returning, file));
    }

    return ret;
  }

  private checkParameter(param: MethodParameter, expected: string, file: IFile): Issue[] {
    const ret: Issue[] = [];
    const regex = new RegExp(expected, "i");
    const name = param.getName();

    if (regex.test(name) === false) {
      if (!this.conf.ignoreNames) {
        throw new Error("update abaplint.json to latest format");
      }
      if (this.conf.ignoreNames.indexOf(name.toUpperCase()) >= 0) {
        return ret;
      }
      const message = "Bad method parameter name \"" + name + "\" expected \"" + expected + "/i\"";
// todo, find the right file
      const issue = new Issue({file, message, code: this.getKey(), start: param.getPosition()});
      ret.push(issue);
    }

    return ret;
  }

}