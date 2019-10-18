import {ABAPObject} from "./_abap_object";
import {FunctionModuleDefinition} from "../abap/types";
import * as xmljs from "xml-js";
import {xmlToArray} from "../xml_utils";

export class FunctionGroup extends ABAPObject {

  public getType(): string {
    return "FUGR";
  }

  public getModules(): FunctionModuleDefinition[] {
    const xml = this.getXML();
    if (xml === undefined) {
      return [];
    }
    const parsed: any = xmljs.xml2js(xml, {compact: true});

    return this.parseModules(parsed);
  }

  public getIncludes(): string[] {
    const xml = this.getXML();
    if (xml === undefined) {
      return [];
    }

    const parsed: any = xmljs.xml2js(xml, {compact: true});
    const includes = parsed.abapGit["asx:abap"]["asx:values"].INCLUDES;

    const ret: string[] = [];
    for (const i of xmlToArray(includes.SOBJ_NAME)) {
      ret.push(i._text);
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

  private parseModules(data: any): FunctionModuleDefinition[] {
    const ret: FunctionModuleDefinition[] = [];

    const functions = data.abapGit["asx:abap"]["asx:values"].FUNCTIONS;
    for (const module of xmlToArray(functions.item)) {
      ret.push(new FunctionModuleDefinition(module));
    }

    return ret;
  }

  private getXML(): string | undefined {
    for (const file of this.getFiles()) {
      if (file.getFilename().match(/\.fugr\.xml$/i)) {
        return file.getRaw();
      }
    }
    return undefined;
  }

}