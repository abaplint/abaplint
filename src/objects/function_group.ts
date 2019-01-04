import {ABAPObject} from "./_abap_object";
import {FunctionModuleDefinition} from "../abap/types";
import * as xmljs from "xml-js";

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

    return this.parse(parsed);
  }

  private parse(data: any): FunctionModuleDefinition[] {
    const ret: FunctionModuleDefinition[] = [];

    const functions = data.abapGit["asx:abap"]["asx:values"].FUNCTIONS;
    if (functions.item.constructur === Array) {
      for (const module of functions.item) {
        ret.push(new FunctionModuleDefinition(module));
      }
    } else {
      ret.push(new FunctionModuleDefinition(functions.item));
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