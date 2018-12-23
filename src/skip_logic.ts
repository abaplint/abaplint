import {Registry} from "./registry";
import {IObject} from "./objects/_iobject";
import {Class, ClassCategory} from "./objects";

export class SkipLogic {
  private reg: Registry;

  constructor(reg: Registry) {
    this.reg = reg;
  }

  public skip(obj: IObject): boolean {

    if (this.reg.getConfig().getGlobal().skipGeneratedGatewayClasses
        && obj instanceof Class
        && this.isGeneratedGatewayClass(obj)) {
      return true;
    } else if (this.reg.getConfig().getGlobal().skipGeneratedPersistentClasses
        && obj instanceof Class
        && this.isGeneratedPersistentClass(obj)) {
      return true;
    }

    return false;
  }

  public isGeneratedGatewayClass(obj: Class): boolean {
    let sup = undefined;

    const definition = obj.getClassDefinition();
    if (definition) {
      sup = definition.getSuperClass();
    }

    if (obj.getName().match(/_MPC$/i) && sup === "/IWBEP/CL_MGW_PUSH_ABS_MODEL") {
      return true;
    }
    if (obj.getName().match(/_DPC$/i) && sup === "/IWBEP/CL_MGW_PUSH_ABS_DATA") {
      return true;
    }
    return false;
  }

  public isGeneratedPersistentClass(obj: Class): boolean {
    if (obj.getCategory() === ClassCategory.Persistent) {
      return true;
    }
    if (obj.getCategory() === ClassCategory.PersistentFactory) {
      return true;
    }

    const main = obj.getClassDefinition();
    if (main) {
      const sup = main.getSuperClass();
      if (sup) {
        const sclass = this.reg.getObject("CLAS", sup.toUpperCase());
        if (sclass && (sclass as Class).getCategory() === ClassCategory.PersistentFactory) {
          return true;
        }
      }
    }

    return false;
  }

}