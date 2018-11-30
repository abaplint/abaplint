import {Registry} from "../registry";
import * as Objects from "../objects";
import * as Types from "../abap/types";

export class Dump {
  private reg: Registry;

  public constructor(reg: Registry) {
    this.reg = reg;
  }

  public classes(): object {
    const ret: any = [];
    for (const obj of this.reg.getObjects()) {
      if (obj instanceof Objects.Class) {
        ret.push({
          type: obj.getType(),
          name: obj.getName(),
          superclass: obj.getSuperClass(),
          methods: this.methods(obj.getMethodDefinitions()),
          attributes: this.attributes(obj.getAttributes()),
        });
      }
    }

    return ret;
  }

  public methods(methods: Types.MethodDefinitions | undefined): any {
    const ret: any = [];

    if (methods === undefined) {
      return undefined;
    }

    for (const m of methods.getAll()) {
      ret.push({
        name: m.getName(),
        scope: m.getScope(),
        parameters: this.parameters(m.getParameters()),
      });
    }

    return ret;
  }

  public parameter(param: Types.MethodParameter | undefined): any {
    if (param === undefined) {
      return undefined;
    }

    return {name: param.getName()};
  }

  public parameters(parameters: Types.MethodParameters): any {
    return {
      importing: parameters.getImporting().map(this.parameter),
      exporting: parameters.getExporting().map(this.parameter),
      changing: parameters.getChanging().map(this.parameter),
      returning: this.parameter(parameters.getReturning()),
      exceptions: parameters.getExceptions(),
    };
  }

  public classAtribute(attr: Types.ClassAttribute): any {
    return {
      name: attr.getName(),
      scope: attr.getScope(),
    };
  }

  public attributes(attributes: Types.ClassAttributes | undefined): any {
    if (attributes === undefined) {
      return undefined;
    }

    return {
      static: attributes.getStatic().map(this.classAtribute),
      instance: attributes.getInstance().map(this.classAtribute),
//      constants: attributes.getConstants()
    };
  }
}