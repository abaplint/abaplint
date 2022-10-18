import {ABAPObject, ITextElements} from "./_abap_object";
import {FunctionModuleDefinition} from "../abap/types";
import {xmlToArray} from "../xml_utils";
import {XMLParser} from "fast-xml-parser";
import {ABAPFile} from "../abap/abap_file";

export class FunctionGroup extends ABAPObject {
  private includes: string[] | undefined = undefined;
  private modules: FunctionModuleDefinition[] | undefined = undefined;

  public getType(): string {
    return "FUGR";
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }

  public setDirty() {
    super.setDirty();
    this.includes = undefined;
    this.modules = undefined;
  }

  public getAllowedNaming() {
    return {
      maxLength: 26,
      allowNamespace: true,
    };
  }

  public getSequencedFiles(): readonly ABAPFile[] {
    const main = this.getMainABAPFile();
    if (main === undefined) {
      return [];
    }
    const sequence = [main];

    for (const m of this.getModules()) {
      const search = "." + m.getName().toLocaleLowerCase().replace(/\//g, "#") + ".abap";
      for (const f of this.getABAPFiles()) {
        if (f.getFilename().toLocaleLowerCase().endsWith(search)) {
          if (sequence.indexOf(f) < 0) {
            sequence.push(f);
          }
          break;
        }
      }
    }

    return sequence;
  }

  public getModules(): FunctionModuleDefinition[] {
    if (this.modules === undefined) {
      this.parseXML();
    }
    if (this.modules === undefined) {
      throw new Error("getIncludes, undefined");
    }

    return this.modules;
  }

  public getIncludeFiles(): {file: ABAPFile, name: string}[] {
    const ret = [];
    const includes = this.getIncludes();
    for (const f of this.getABAPFiles()) {
      for (const i of includes) {
        const namespaced = i.startsWith("/") && i.includes("/L");
        let search = i;
        if (namespaced) {
          search = search.replace(/\//g, "#");
        }
        if ((i.startsWith("L") || namespaced) && f.getFilename().includes(search.toLowerCase())) {
          ret.push({file: f, name: i});
        }

        // fix for URL encoded? Uris
        if (namespaced) {
          search = i.replace(/\//g, "%23");
          if (f.getFilename().includes(search.toLowerCase())) {
            ret.push({file: f, name: i});
          }
        }
      }
    }
    return ret;
  }

  public getInclude(name: string): ABAPFile | undefined {
    const upper = name.toUpperCase();
    const includes = this.getIncludeFiles();
    for (const i of includes) {
      if (i.name.toUpperCase() === upper) {
        return i.file;
      }
    }
    return undefined;
  }

  public getMainABAPFile(): ABAPFile | undefined {
    const regex = new RegExp(/\.fugr\.(#\w+#)?sapl/, "i");
    for (const f of this.getABAPFiles()) {
      if (regex.test(f.getFilename())) {
        return f;
      }
    }
    return undefined;
  }

  public getIncludes(): string[] {
    if (this.includes === undefined) {
      this.parseXML();
    }
    if (this.includes === undefined) {
      throw new Error("getIncludes, undefined");
    }

    return this.includes;
  }

  public getModule(name: string): FunctionModuleDefinition | undefined {
    for (const mod of this.getModules()) {
      if (mod.getName().toUpperCase() === name.toUpperCase()) {
        return mod;
      }
    }
    return undefined;
  }

  public getTexts(): ITextElements {
    if (this.texts === undefined) {
      const found = this.findTextFile();
      if (found === undefined) {
        return {};
      }

      const parsed = new XMLParser({parseTagValue: false, ignoreAttributes: true, trimValues: false}).parse(found.getRaw());
      this.findTexts(parsed);
    }

    return this.texts!;
  }

/////////////////////////////////

  private parseXML() {
    this.includes = [];
    this.modules = [];

    const parsed = this.parseRaw2();
    if (parsed === undefined) {
      return;
    }

    // INCLUDES
    const includes = parsed.abapGit["asx:abap"]["asx:values"]?.INCLUDES;
    if (includes !== undefined) {
      for (const i of xmlToArray(includes.SOBJ_NAME)) {
        this.includes.push(i);
      }
    }

    // FUNCTION MODULES
    const functions = parsed.abapGit["asx:abap"]["asx:values"]?.FUNCTIONS;
    for (const module of xmlToArray(functions?.item)) {
      this.modules.push(new FunctionModuleDefinition(module));
    }
  }

  private findTextFile() {
    const search = this.getName() + ".fugr.sapl" + this.getName() + ".xml";
    for (const f of this.getFiles()) {
      if (f.getFilename().includes(search.toLowerCase())) {
        return f;
      }
    }
    return undefined;
  }

}
