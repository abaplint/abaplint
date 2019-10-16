import {Registry} from "../../registry";
import * as Objects from "../../objects";
import * as Types from "../../abap/types";

export class Dump {
  private readonly reg: Registry;

  public constructor(reg: Registry) {
    this.reg = reg;
  }

  public classes(): object {
    const ret: any = [];
    for (const obj of this.reg.getObjects()) {
      if (obj instanceof Objects.Class) {
        const definition = obj.getClassDefinition();
        if (definition === undefined) {
          continue;
        }
        ret.push({
          type: obj.getType(),
          name: obj.getName(),
          superclass: definition.getSuperClass(),
          methods: this.methods(definition.getMethodDefinitions()),
          attributes: this.attributes(definition.getAttributes()),
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
        visibility: m.getVisibility(),
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
      visibility: attr.getVisibility(),
    };
  }

  public attributes(attributes: Types.Attributes | undefined): any {
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