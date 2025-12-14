import {xmlToArray} from "../xml_utils";
import {AbstractObject} from "./_abstract_object";
import {Interface} from "./interface";
import {MemoryFile} from "../files/memory_file";
import {IRegistry} from "../_iregistry";
import {Version} from "../version";

interface ProxyDataItem {
  OBJECT?: string;
  OBJ_NAME?: string;
  OBJECT1?: string;
  OBJ_NAME1?: string;
  OBJECT2?: string;
  OBJ_NAME2?: string;
  OBJECT_R?: string;
  OBJ_NAME_R?: string;
  R3_TYPE?: string;
  R3_NAME?: string;
  R3_TEXT?: string;
  IFR_TYPE?: string;
  IFR_NAME?: string;
}

interface ParsedProxy {
  proxyData: ProxyDataItem[];
}

export class ProxyObject extends AbstractObject {
  private parsedXML: ParsedProxy | undefined;

  public getType(): string {
    return "SPRX";
  }

  public getAllowedNaming() {
    return {
      maxLength: 34,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    this.parse();
    const intfItem = this.parsedXML?.proxyData.find(i => i.R3_TYPE === "INTF");
    return intfItem?.R3_TEXT;
  }

  public setDirty(): void {
    this.parsedXML = undefined;
    super.setDirty();
  }

  public parse(_version?: Version, _globalMacros?: readonly string[], reg?: IRegistry) {
    if (this.parsedXML) {
      return {updated: false, runtime: 0};
    }

    const start = Date.now();
    this.parsedXML = this.parseXML();
    const end = Date.now();

    const objects = this.generateABAPObjects();
    for (const obj of objects) {
      reg?.addDependencies(obj.getFiles());
    }

    return {updated: true, runtime: end - start};
  }

  private parseXML(): ParsedProxy {
    const result: ParsedProxy = {proxyData: []};
    const parsed = super.parseRaw2();

    if (parsed === undefined
        || parsed.abapGit === undefined
        || parsed.abapGit["asx:abap"]?.["asx:values"] === undefined) {
      return result;
    }

    const values = parsed.abapGit["asx:abap"]["asx:values"];
    result.proxyData = xmlToArray(values.PROXY_DATA?.item);

    return result;
  }

  public generateABAPObjects(): AbstractObject[] {
    this.parse();
    const result: AbstractObject[] = [];

    if (!this.parsedXML) {
      return result;
    }

    // Find interface definition
    const intfItem = this.parsedXML.proxyData.find(i => i.R3_TYPE === "INTF");
    if (!intfItem || !intfItem.R3_NAME) {
      return result;
    }

    const intfName = intfItem.R3_NAME.toLowerCase();

    // Find methods
    const methods = this.parsedXML.proxyData.filter(i => i.R3_TYPE === "METH");

    // Build interface code
    let code = `INTERFACE ${intfName} PUBLIC.\n`;

    for (const method of methods) {
      const methodName = method.R3_NAME?.toLowerCase();
      if (!methodName) {
        continue;
      }

      // Find parameters for this method
      const params = this.parsedXML.proxyData.filter(
        i => i.R3_TYPE === "PAIM" && i.OBJ_NAME1 === method.OBJ_NAME1
      );

      code += `  METHODS ${methodName}\n`;

      if (params.length > 0) {
        code += `    IMPORTING\n`;
        for (const param of params) {
          const paramName = param.OBJ_NAME2?.toLowerCase();
          const paramType = param.OBJ_NAME_R?.toLowerCase();
          code += `      ${paramName} TYPE ${paramType} .\n`;
        }
      }
    }

    code += `ENDINTERFACE.`;

    // Create the interface object
    const intf = new Interface(intfName.toUpperCase());
    intf.addFile(new MemoryFile(`${intfName}.intf.abap`, code));

    result.push(intf);

    return result;
  }
}
