import {AbstractObject} from "./_abstract_object";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import * as Types from "../abap/types/basic";
import * as xmljs from "xml-js";
import {Registry} from "../registry";
import {DDIC} from "../ddic";

export class TableType extends AbstractObject {

  public getType(): string {
    return "TTYP";
  }

  public parseType(reg: Registry): AbstractType {
    const parsed = this.parseXML();
    if (parsed === undefined) {
      return new Types.UnknownType("Table Type, parser error");
    }

    const ddic = new DDIC(reg);
    const rowtype = parsed.abapGit["asx:abap"]["asx:values"].DD40V.ROWTYPE._text;
    const rowkind = parsed.abapGit["asx:abap"]["asx:values"].DD40V.ROWKIND._text;

    if (rowkind === "S") {
      return new Types.TableType(ddic.lookupTable(rowtype));
    } else if (rowkind === "E") {
      return new Types.TableType(ddic.lookupDataElement(rowtype));
    } else {
      return new Types.UnknownType("Table Type, unkown kind \"" + rowkind + "\"");
    }
  }

///////////////////

  private parseXML(): any | undefined {
    const xml = this.getXML();
    if (xml === undefined) {
      return undefined;
    }
    return xmljs.xml2js(xml, {compact: true});
  }

  private getXML(): string | undefined {
    for (const file of this.getFiles()) {
      if (file.getFilename().match(/\.ttyp\.xml$/i)) {
        return file.getRaw();
      }
    }
    return undefined;
  }

}