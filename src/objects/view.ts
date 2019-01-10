import {AbstractObject} from "./_abstract_object";
import * as xmljs from "xml-js";
import {xmlToArray} from "../xml_utils";

export class View extends AbstractObject {

  public getType(): string {
    return "VIEW";
  }

  public getFields(): string[] {
    const xml = this.getXML();
    if (xml === undefined) {
      return [];
    }
    const parsed: any = xmljs.xml2js(xml, {compact: true});

    return this.parse(parsed);
  }

  private parse(data: any): string[] {
    const ret: string[] = [];

    const fields = data.abapGit["asx:abap"]["asx:values"].DD27P_TABLE;
    for (const field of xmlToArray(fields.DD27P)) {
      ret.push(field.VIEWFIELD._text);
    }

    return ret;
  }

  private getXML(): string | undefined {
    for (const file of this.getFiles()) {
      if (file.getFilename().match(/\.view\.xml$/i)) {
        return file.getRaw();
      }
    }
    return undefined;
  }

}