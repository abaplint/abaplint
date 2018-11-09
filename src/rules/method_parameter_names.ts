import {Issue} from "../issue";
import {IRule} from "./_irule";
import {IObject} from "../objects/_iobject";
import {Class, Interface} from "../objects";
import {MethodDefinition} from "../abap/types/method_definition";
import {MethodParameter} from "../abap/types/method_parameter";
import {Registry} from "../registry";

export class MethodParameterNamesConf {
  public enabled: boolean = true;
  public importing: string = "^I._.*$";
  public returning: string = "^R._.*$";
  public changing: string = "^C._.*$";
  public exporting: string = "^E._.*$";
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
      if (obj.isException()) {
        return [];
      }
      if (obj.getMethodDefinitions()) {
        methods = obj.getMethodDefinitions().getAll();
      }
    } else if (obj instanceof Interface) {
      methods = obj.getMethodDefinitions();
    }

    for (let method of methods) {
      ret = ret.concat(this.checkMethod(method, obj));
    }

    return ret;
  }

  private checkMethod(method: MethodDefinition, obj: IObject): Issue[] {
    let ret: Issue[] = [];

    const parameters = method.getParameters();
    for (let param of parameters.getImporting()) {
      ret = ret.concat(this.checkParameter(param, this.conf.importing, obj));
    }
    for (let param of parameters.getExporting()) {
      ret = ret.concat(this.checkParameter(param, this.conf.exporting, obj));
    }
    for (let param of parameters.getChanging()) {
      ret = ret.concat(this.checkParameter(param, this.conf.changing, obj));
    }
    let returning = parameters.getReturning();
    if (returning) {
      ret = ret.concat(this.checkParameter(returning, this.conf.returning, obj));
    }

    return ret;
  }

  private checkParameter(param: MethodParameter, expected: string, obj: IObject): Issue[] {
    let ret: Issue[] = [];
    let regex = new RegExp(expected, "i");
    let name = param.getName();

    if (regex.test(name) === false) {
      const message = "Bad method parameter name \"" + name + "\" expected \"" + expected + "\"";
// todo, find the right file
      let issue = new Issue({file: obj.getFiles()[0], message, code: this.getKey(), start: param.getPosition()});
      ret.push(issue);
    }

    return ret;
  }

}