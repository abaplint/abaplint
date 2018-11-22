import {Issue} from "../issue";
import {IRule} from "./_irule";
import {IObject} from "../objects/_iobject";
import {Class, Interface} from "../objects";
import {MethodDefinition} from "../abap/types/method_definition";
import {MethodParameter} from "../abap/types/method_parameter";
import {Registry} from "../registry";

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
    let methods: MethodDefinition[] = [];

// todo, consider local classes(PROG, FUGR, CLAS)

    if (obj instanceof Class) {
      if (this.conf.ignoreExceptions && obj.isException()) {
        return [];
      }
      const definitions = obj.getMethodDefinitions();
      if (definitions === undefined) {
        return [];
      }
      methods = definitions.getAll();
    } else if (obj instanceof Interface) {
      methods = obj.getMethodDefinitions();
    }

    for (const method of methods) {
      ret = ret.concat(this.checkMethod(method, obj));
    }

    return ret;
  }

  private checkMethod(method: MethodDefinition, obj: IObject): Issue[] {
    let ret: Issue[] = [];

    const parameters = method.getParameters();
    for (const param of parameters.getImporting()) {
      ret = ret.concat(this.checkParameter(param, this.conf.importing, obj));
    }
    for (const param of parameters.getExporting()) {
      ret = ret.concat(this.checkParameter(param, this.conf.exporting, obj));
    }
    for (const param of parameters.getChanging()) {
      ret = ret.concat(this.checkParameter(param, this.conf.changing, obj));
    }
    const returning = parameters.getReturning();
    if (returning) {
      ret = ret.concat(this.checkParameter(returning, this.conf.returning, obj));
    }

    return ret;
  }

  private checkParameter(param: MethodParameter, expected: string, obj: IObject): Issue[] {
    const ret: Issue[] = [];
    const regex = new RegExp(expected, "i");
    const name = param.getName();

    if (regex.test(name) === false) {
      if (this.conf.ignoreNames.indexOf(name.toUpperCase()) >= 0) {
        return ret;
      }
      const message = "Bad method parameter name \"" + name + "\" expected \"" + expected + "/i\"";
// todo, find the right file
      const issue = new Issue({file: obj.getFiles()[0], message, code: this.getKey(), start: param.getPosition()});
      ret.push(issue);
    }

    return ret;
  }

}