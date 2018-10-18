import * as Objects from "./objects";
import {ABAPObject} from "./objects";
import {ParsedFile} from "./files";

export default class Registry {

  private macros: Array<string> = [];
  private objects: Array<Objects.Object> = [];

  public getObjects(): Array<Objects.Object> {
    return this.objects;
  }

  public getABAPObjects(): Array<ABAPObject> {
    return this.objects.filter((obj) => { return obj instanceof ABAPObject; }) as Array<ABAPObject>;
  }

  public getParsedFiles(): Array<ParsedFile> {
    let ret: Array<ParsedFile> = [];
    this.getABAPObjects().forEach((a) => {ret = ret.concat(a.getParsed()); });
    return ret;
  }

  public findOrCreate(name: string, type: string): Objects.Object {
    for (let obj of this.objects) {
      if (obj.getType() === type && obj.getName() === name) {
        return obj;
      }
    }

    let add = undefined;
// todo, refactor
    switch (type) {
      case "CLAS":
        add = new Objects.Class(name, "todo");
        break;
      case "TYPE":
        add = new Objects.TypePool(name, "todo");
        break;
      case "DEVC":
        add = new Objects.Package(name, "todo");
        break;
      case "MSAG":
        add = new Objects.MessageClass(name, "todo");
        break;
      case "INTF":
        add = new Objects.Interface(name, "todo");
        break;
      case "DTEL":
        add = new Objects.DataElement(name, "todo");
        break;
      case "TABL":
        add = new Objects.Table(name, "todo");
        break;
      case "TTYP":
        add = new Objects.TableType(name, "todo");
        break;
      case "DOMA":
        add = new Objects.Domain(name, "todo");
        break;
      case "PROG":
        add = new Objects.Program(name, "todo");
        break;
      case "SMIM":
        add = new Objects.MIMEObject(name, "todo");
        break;
      case "FUGR":
        add = new Objects.FunctionGroup(name, "todo");
        break;
      case "TRAN":
        add = new Objects.Transaction(name, "todo");
        break;
      case "SICF":
        add = new Objects.ICFService(name, "todo");
        break;
      case "W3MI":
        add = new Objects.WebMIME(name, "todo");
        break;
      case "DCLS":
        add = new Objects.DataControl(name, "todo");
        break;
      case "DDLS":
        add = new Objects.DataDefinition(name, "todo");
        break;
      case "XSLT":
        add = new Objects.Transformation(name, "todo");
        break;
      case "ENQU":
        add = new Objects.LockObject(name, "todo");
        break;
      default:
        throw new Error("Unknown object type: " + type);
    }

    this.objects.push(add);

    return add;
  }

// todo, handle scoping for macros
  public addMacro(name: string) {
    if (this.isMacro(name)) {
      return;
    }
    this.macros.push(name.toUpperCase());
  }

  public isMacro(name: string): boolean {
    for (let mac of this.macros) {
      if (mac === name.toUpperCase()) {
        return true;
      }
    }
    return false;
  }

}