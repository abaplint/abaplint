import {AbstractObject} from "./_abstract_object";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import * as Types from "../abap/types/basic";
import {IRegistry} from "../_iregistry";
import {DDIC} from "../ddic";
import {xmlToArray} from "../xml_utils";
import {Identifier} from "../abap/4_file_information/_identifier";
import {Identifier as IdentifierToken} from "../abap/1_lexer/tokens/identifier";
import {Position} from "../position";

export interface DomainValue {
  language: string,
  low: string,
  high: string,
  description: string
}
export interface DomainValueTranslation {
  language: string,
  description: string
}

export class Domain extends AbstractObject {

  private parsedXML: {
    description?: string,
    datatype?: string,
    length?: string,
    decimals?: string,
    conversionExit?: string,
    values?: DomainValue[],
    valuesTranslations?: DomainValueTranslation[],
  } | undefined;

  public getType(): string {
    return "DOMA";
  }

  public getDescription(): string | undefined {
    this.parse();
    return this.parsedXML?.description;
  }

  public getConversionExit(): string | undefined {
    this.parse();
    return this.parsedXML?.conversionExit;
  }

  public getDataType(): string | undefined {
    this.parse();
    return this.parsedXML?.datatype;
  }

  public getAllowedNaming() {
    return {
      maxLength: 30,
      allowNamespace: true,
    };
  }

  public getIdentifier(): Identifier | undefined {
    const xmlIdentifier = super.getIdentifier();
    if (xmlIdentifier) {
      return xmlIdentifier;
    }

    const file = this.getAFFFile();
    if (file === undefined) {
      return undefined;
    }
    return new Identifier(new IdentifierToken(new Position(1, 1), this.getName()), file.getFilename());
  }

  public setDirty(): void {
    this.parsedXML = undefined;
    super.setDirty();
  }

  public parseType(reg: IRegistry, dataElement?: string, description?: string): AbstractType {
    // dont cache the DOMA parsed type, they are cached on DTEL level
    // also note that the type carries the name of the DTEL
    if (this.parsedXML === undefined) {
      this.parse();
    }
    if (this.parsedXML === undefined) {
      return new Types.UnknownType("Domain " + this.getName() + " parser error", this.getName());
    }
    const ddic = new DDIC(reg);
    return ddic.textToType({
      text: this.parsedXML.datatype,
      length: this.parsedXML.length,
      decimals: this.parsedXML.decimals,
      infoText: this.getName(),
      qualifiedName: dataElement,
      conversionExit: this.parsedXML.conversionExit,
      ddicName: dataElement,
      description: description,
    });
  }

  public parse() {
    if (this.parsedXML) {
      return {updated: false, runtime: 0};
    }

    const start = Date.now();
    this.parsedXML = {};

    const jsonFile = this.getAFFFile();
    if (jsonFile) {
      try {
        const parsed = JSON.parse(jsonFile.getRaw());
        const language = parsed.header?.originalLanguage;
        const values: DomainValue[] = [];
        for (const fixedValue of parsed.fixedValues ?? []) {
          values.push({
            low: fixedValue?.fixedValue,
            high: "",
            description: fixedValue?.description,
            language: language,
          });
        }
        for (const interval of parsed.fixedValueIntervals ?? []) {
          values.push({
            low: interval?.lowLimit,
            high: interval?.highLimit,
            description: interval?.description,
            language: language,
          });
        }
        this.parsedXML = {
          description: parsed.header?.description,
          datatype: parsed.format?.dataType,
          length: parsed.format?.length?.toString(),
          decimals: parsed.format?.decimals?.toString(),
          conversionExit: parsed.outputCharacteristics?.conversionRoutine,
          values: values,
          valuesTranslations: [],
        };
      } catch {
        // handled by parseType()
      }
      const end = Date.now();
      return {updated: true, runtime: end - start};
    }

    const parsed = super.parseRaw2();
    if (parsed === undefined) {
      return {updated: false, runtime: 0};
    }

    const dd01v = parsed.abapGit?.["asx:abap"]?.["asx:values"]?.DD01V;
    const dd07v_tab = xmlToArray(parsed.abapGit?.["asx:abap"]?.["asx:values"]?.DD07V_TAB?.DD07V);
    const values: DomainValue[] = [];
    for (const ddo7v of dd07v_tab) {
      const value: DomainValue = {
        description: ddo7v?.DDTEXT,
        low: ddo7v?.DOMVALUE_L,
        high: ddo7v?.DOMVALUE_H,
        language: ddo7v?.DDLANGUAGE,
      };
      values.push(value);
    }

    const dd07v_texts = xmlToArray(parsed.abapGit?.["asx:abap"]?.["asx:values"]?.DD07_TEXTS?.item);
    const translationValues: DomainValueTranslation[] = [];
    for (const dd07v of dd07v_texts) {
      const value: DomainValueTranslation = {
        language: dd07v?.DDLANGUAGE,
        description: dd07v?.DDTEXT,
      };
      translationValues.push(value);
    }

    this.parsedXML = {
      description: dd01v?.DDTEXT,
      datatype: dd01v?.DATATYPE,
      length: dd01v?.LENG,
      conversionExit: dd01v?.CONVEXIT,
      decimals: dd01v?.DECIMALS,
      values: values,
      valuesTranslations: translationValues,
    };
    const end = Date.now();
    return {updated: true, runtime: end - start};
  }

  public getFixedValues() {
    return this.parsedXML?.values ?? [];
  }

  public getFixedValuesTranslations() {
    return this.parsedXML?.valuesTranslations ?? [];
  }

  private getAFFFile() {
    return this.getFiles().find(file => file.getFilename().toLowerCase().endsWith(".doma.json"));
  }

}
