import {ABAPObject, ITextElement} from "./_abap_object";
import {FunctionModuleDefinition} from "../abap/types";
import {xmlToArray} from "../xml_utils";
import {ABAPFile} from "../files";
import * as xmljs from "xml-js";

export class FunctionGroup extends ABAPObject {

  public getType(): string {
    return "FUGR";
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
      const search = "." + m.getName().toLocaleLowerCase() + ".abap";
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

  // todo, cache parsed data
  public getModules(): FunctionModuleDefinition[] {
    const xml = this.getXML();
    if (xml === undefined) {
      return [];
    }
    const parsed = this.parseRaw();
    if (parsed === undefined) {
      return [];
    }

    return this.parseModules(parsed);
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
          ret.push({
            file: f,
            name: i});
        }
      }
    }
    return ret;
  }

  public getInclude(name: string): ABAPFile | undefined {
    const includes = this.getIncludeFiles();
    for (const i of includes) {
      if (i.name.toUpperCase() === name.toUpperCase()) {
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
    const xml = this.getXML();
    if (xml === undefined) {
      return [];
    }

    const parsed = this.parseRaw();
    if (parsed === undefined) {
      return [];
    }
    const includes = parsed.abapGit["asx:abap"]["asx:values"].INCLUDES;
    if (includes === undefined) {
      return [];
    }

    const ret: string[] = [];
    for (const i of xmlToArray(includes.SOBJ_NAME)) {
      ret.push(i?._text);
    }

    return ret;
  }

  public getModule(name: string): FunctionModuleDefinition | undefined {
    for (const mod of this.getModules()) {
      if (mod.getName().toUpperCase() === name.toUpperCase()) {
        return mod;
      }
    }
    return undefined;
  }

  public getTexts(): readonly ITextElement[] {
    if (this.texts === undefined) {
      const found = this.findTextFile();
      if (found === undefined) {
        return [];
      }

      const parsed = xmljs.xml2js(found.getRaw(), {compact: true});
      this.findTexts(parsed);
    }

    return this.texts!;
  }

/////////////////////////////////

  private parseModules(data: any): FunctionModuleDefinition[] {
    const ret: FunctionModuleDefinition[] = [];

    const functions = data.abapGit["asx:abap"]["asx:values"].FUNCTIONS;
    for (const module of xmlToArray(functions.item)) {
      ret.push(new FunctionModuleDefinition(module));
    }

    return ret;
  }

  private findTextFile() {
    const search = this.getName() + ".fugr.sapl" + this.getName() + ".xml";
    for (const f of this.files) {
      if (f.getFilename().includes(search.toLowerCase())) {
        return f;
      }
    }
    return undefined;
  }

}
