import {ABAPObject} from "./_abap_object";
import {ClassDefinition} from "../abap/types/class_definition";
import * as xmljs from "xml-js";
import {IFile} from "../files/_ifile";
import {ABAPFile} from "../files";

export enum ClassCategory {
  Test = "05",
  Persistent = "10",
  PersistentFactory = "11",
  Exception = "40",
  SharedObject = "45",
}

export class Class extends ABAPObject {
// todo, add dirty flag so things can be cached?

  public getType(): string {
    return "CLAS";
  }

// todo, rename to "getDefinition" ?
  public getClassDefinition(): ClassDefinition | undefined {
    const main = this.getMainABAPFile();
    if (!main) {
      return undefined;
    }
    const definitions = main.getClassDefinitions();
    if (definitions.length === 0) {
      return undefined;
    }
    return definitions[0];
  }

  /*
  public getLocalClasses(): ClassDefinition[] {
    const ret: ClassDefinition[] = [];
    for (const file of this.getParsedFiles()) {
      const stru = file.getStructure();
      if (stru) {
        const nodes = stru.findAllStructures(Structures.ClassDefinition);
        for (const node of nodes) {
          ret.push(new ClassDefinition(node));
        }
      }
    }
    return ret;
  }
 */

// -------------------

  public getDescription(): string | undefined {
    const xml = this.getXML();
    if (!xml) {
      return undefined;
    }
    const parsed: any = xmljs.xml2js(xml, {compact: true});
    if (parsed.abapGit["asx:abap"]["asx:values"] === undefined) {
      return undefined;
    }
    const vseo = parsed.abapGit["asx:abap"]["asx:values"].VSEOCLASS;
    return vseo.DESCRIPT ? vseo.DESCRIPT._text : "";
  }

  public getCategory(): string | undefined {
    const xml = this.getXML();
    if (!xml) {
      return undefined;
    }
    const result = xml.match(/<CATEGORY>(\d{2})<\/CATEGORY>/);
    if (result) {
// https://blog.mariusschulz.com/2017/10/27/typescript-2-4-string-enums#no-reverse-mapping-for-string-valued-enum-members
      return result[1];
    } else {
      return undefined;
    }
  }

  public isGeneratedProxy(): boolean {
    const xml = this.getXML();
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

// --------------------

  public getXMLFile(): IFile | undefined {
    for (const file of this.getFiles()) {
      if (file.getFilename().endsWith(".clas.xml")) {
        return file;
      }
    }
    return undefined;
  }

  public getLocalsImpFile(): ABAPFile | undefined {
    for (const file of this.getABAPFiles()) {
      if (file.getFilename().endsWith(".clas.locals_imp.abap")) {
        return file;
      }
    }
    return undefined;
  }

  public getXML(): string | undefined {
    const file = this.getXMLFile();
    if (file) {
      return file.getRaw();
    }
    return undefined;
  }

}