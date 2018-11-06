import {Issue} from "../issue";
import {IRule} from "./_irule";
import {IObject} from "../objects/_iobject";
import {Class, Interface} from "../objects";
import {MethodDefinition} from "../objects/class/method_definition";
import {MethodParameter} from "../objects/class/method_parameter";
import {Registry} from "../registry";

export class MethodParameterNamesConf {
  public enabled: boolean = true;
}

export class MethodParameterNames implements IRule {

  private conf = new MethodParameterNamesConf();

  public getKey(): string {
    return "method_parameter_names";
  }

  public getDescription(): string {
    return "Method Parameter Names";
  }

  public getMessage() {
    return "Bad method parameter name";
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
      methods = obj.getMethodDefinitions().getAll();
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

    for (let param of method.getParameters().getImporting()) {
      ret = ret.concat(this.checkParameter(param, "^I._.*$", obj));
    }
    for (let param of method.getParameters().getExporting()) {
      ret = ret.concat(this.checkParameter(param, "^E._.*$", obj));
    }
    for (let param of method.getParameters().getChanging()) {
      ret = ret.concat(this.checkParameter(param, "^C._.*$", obj));
    }

// todo, handle returning, also in method_parameters.ts
//    method.getParameters().getReturning();

    return ret;
  }

  private checkParameter(param: MethodParameter, expected: string, obj: IObject): Issue[] {
    let ret: Issue[] = [];
    let regex = new RegExp(expected, "i");

    if (regex.test(param.getName()) === false) {
// todo, find the right file
// todo, find the right start position
      let issue = new Issue({rule: this, file: obj.getFiles()[0], message: 1, start: param.getPosition()});
      ret.push(issue);
    }

    return ret;
  }

}