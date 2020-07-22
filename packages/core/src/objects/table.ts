import {AbstractObject} from "./_abstract_object";
import {xmlToArray} from "../xml_utils";
import * as Types from "../abap/types/basic";
import {IRegistry} from "../_iregistry";
import {DDIC} from "../ddic";

export enum EnhancementCategory {
  NotClassified = "0",
  CannotBeEhanced = "1",
  Character = "2",
  CharacterOrNumeric = "3",
  Deep = "4",
}

export enum TableCategory {
  Transparent = "TRANSP",
  Structure = "INTTAB",
  Cluster = "CLUSTER",
  Pooled = "POOL",
  View = "VIEW",
  Append = "APPEND",
}

export class Table extends AbstractObject {

  public getType(): string {
    return "TABL";
  }

  public getAllowedNaming() {
    return {
      maxLength: 30,
      allowNamespace: true,
    };
  }

  // todo, cache parsed data
  public parseType(reg: IRegistry): Types.StructureType | Types.UnknownType | Types.VoidType {
    const parsed = this.parseXML();
    if (parsed === undefined) {
      return new Types.UnknownType("Table, parser error");
    }

    const components: Types.IStructureComponent[] = [];
    const fields = parsed.abapGit["asx:abap"]["asx:values"].DD03P_TABLE;
    const ddic = new DDIC(reg);
    for (const field of xmlToArray(fields.DD03P)) {
      const comptype = field.COMPTYPE ? field.COMPTYPE._text : "";
      if (comptype === "E") { // data element
        components.push({
          name: field.FIELDNAME._text,
          type: ddic.lookupDataElement(field.ROLLNAME._text)});
      } else if (comptype === "S" && field.FIELDNAME._text === ".INCLUDE") { // incude structure
        const found = ddic.lookupTable(field.PRECFIELD._text);
        if (found instanceof Types.StructureType) {
          for (const c of found.getComponents()) {
            components.push({
              name: c.name,
              type: c.type});
          }
        } else if (found instanceof Types.UnknownType) {
          return found;
        } else if (found instanceof Types.VoidType) {
          // set the full structure to void
          return found;
        } else {
          components.push({
            name: field.FIELDNAME._text,
            type: found});
        }
      } else if (comptype === "S" && field.FIELDNAME._text.startsWith(".INCLU-")) {
        components.push({
          name: field.FIELDNAME._text,
          type: new Types.UnknownType("Table " + this.getName() + ", todo, group named INCLUDE")});
      } else if (comptype === "S") {
        components.push({
          name: field.FIELDNAME._text,
          type: ddic.lookupTable(field.ROLLNAME._text)});
      } else if (comptype === "R") {
        components.push({
          name: field.FIELDNAME._text,
          type: new Types.ObjectReferenceType(field.ROLLNAME._text)});
      } else if (comptype === "L") {
        components.push({
          name: field.FIELDNAME._text,
          type: ddic.lookupTableType(field.ROLLNAME._text)});
      } else if (comptype === "") { // built in
        const datatype = field.DATATYPE._text;
        const length = field.LENG ? field.LENG._text : field.INTLEN._text;
        const decimals = field.DECIMALS ? field.DECIMALS._text : undefined;
        components.push({
          name: field.FIELDNAME._text,
          type: ddic.textToType(datatype, length, decimals)});
      } else {
        components.push({
          name: field.FIELDNAME._text,
          type: new Types.UnknownType("Table " + this.getName() + ", unknown component type " + comptype)});
      }
    }

    return new Types.StructureType(components);
  }

  public getTableCategory(): TableCategory | undefined {
    const parsed = this.parseXML();
    if (parsed === undefined) {
      return undefined;
    }

    return parsed.abapGit["asx:abap"]["asx:values"].DD02V.TABCLASS._text;
  }

  public getEnhancementCategory(): EnhancementCategory {
    const parsed = this.parseXML();
    if (parsed === undefined) {
      return EnhancementCategory.NotClassified;
    }
    if (parsed.abapGit["asx:abap"]["asx:values"].DD02V.EXCLASS === undefined) {
      return EnhancementCategory.NotClassified;
    }

    return parsed.abapGit["asx:abap"]["asx:values"].DD02V.EXCLASS._text;
  }

}
