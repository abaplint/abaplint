import {IObject} from "./objects/_iobject";
import {Class, ClassCategory, FunctionGroup, MaintenanceAndTransportObject, Interface} from "./objects";
import {IRegistry} from "./_iregistry";

export class SkipLogic {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
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
    } else if (this.reg.getConfig().getGlobal().skipGeneratedFunctionGroups
        && obj instanceof FunctionGroup
        && this.isGeneratedFunctionGroup(obj)) {
      return true;
    } else if (obj instanceof Class && this.isGeneratedProxyClass(obj)) {
      return true;
    } else if (obj instanceof Interface && this.isGeneratedProxyInterface(obj)) {
      return true;
    } else if (obj instanceof Interface && this.isGeneratedBOPFInterface(obj)) {
      return true;
    }

    return false;
  }

  private isGeneratedBOPFInterface(obj: Interface): boolean {
    const implementing = obj.getDefinition()?.getImplementing();
    if (implementing === undefined) {
      return false;
    }
    for (const i of implementing) {
      if (i.name.toUpperCase() === "/BOBF/IF_LIB_CONSTANTS") {
        return true;
      }
    }
    return false;
  }

  private isGeneratedProxyInterface(obj: Interface): boolean {
    const xml = obj.getXML();
    if (!xml) {
      return false;
    }
    const result = xml.match(/<CLSPROXY>(.)<\/CLSPROXY>/);
    if (result) {
      return true;
    } else {
      return false;
    }
  }

  private isGeneratedProxyClass(obj: Class): boolean {
    const xml = obj.getXML();
    if (!xml) {
      return false;
    }
    const result = xml.match(/<CLSPROXY>(.)<\/CLSPROXY>/);
    if (result) {
      return true;
    } else {
      return false;
    }
  }

  private isGeneratedFunctionGroup(group: FunctionGroup): boolean {
    this.reg.getObject("TOBJ", "");
    for (const obj of this.reg.getObjects()) {
      if (obj.getType() !== "TOBJ") {
        continue;
      }
      const tobj = obj as MaintenanceAndTransportObject;
      if (tobj.getArea() === group.getName()) {
        return true;
      }
    }
    return false;
  }

  private isGeneratedGatewayClass(obj: Class): boolean {
    let sup = undefined;

    const definition = obj.getClassDefinition();
    if (definition) {
      sup = definition.superClassName;
    }

    if (obj.getName().match(/_MPC$/i) && sup === "/IWBEP/CL_MGW_PUSH_ABS_MODEL") {
      return true;
    }
    if (obj.getName().match(/_DPC$/i) && sup === "/IWBEP/CL_MGW_PUSH_ABS_DATA") {
      return true;
    }
    return false;
  }

  private isGeneratedPersistentClass(obj: Class): boolean {
    if (obj.getCategory() === ClassCategory.Persistent) {
      return true;
    }
    if (obj.getCategory() === ClassCategory.PersistentFactory) {
      return true;
    }

    const main = obj.getClassDefinition();
    if (main) {
      const sup = main.superClassName;
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