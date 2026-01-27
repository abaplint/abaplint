import {AbstractObject} from "./_abstract_object";
import {Message} from "../abap/types/message";
import {xmlToArray, unescape} from "../xml_utils";

export type parsedMessageClass = {
  topName: string | undefined,
  description: string | undefined,
  parsedMessages: Message[] | undefined
};

export class MessageClass extends AbstractObject {
  private xml: parsedMessageClass | undefined = undefined;

  public getType(): string {
    return "MSAG";
  }

  public getDescription(): string | undefined {
    this.parseXML();
    return this.xml?.description;
  }

  public getAllowedNaming() {
    return {
      maxLength: 20,
      allowNamespace: true,
    };
  }

  public getParsed(): parsedMessageClass | undefined {
    this.parseXML();
    return this.xml;
  }

  public setDirty(): void {
    this.xml = undefined;
    super.setDirty();
  }

  public getMessages(): readonly Message[] {
    this.parseXML();
    const msg = this.xml?.parsedMessages;
    return msg ? msg : [];
  }

  public getByNumber(num: string): Message | undefined {
    this.parseXML();
    // todo, optimize performance,
    for (const message of this.getMessages()) {
      if (message.getNumber() === num) {
        return message;
      }
    }
    return undefined;
  }

/////////////////////////////////

  private parseXML() {
    if (this.xml !== undefined) {
      return;
    }

    this.xml = {
      topName: undefined,
      description: undefined,
      parsedMessages: [],
    };

    const parsed = super.parseRaw2();
    if (parsed === undefined) {
      return;
    }

    this.xml.topName = parsed?.abapGit?.["asx:abap"]["asx:values"]?.T100A?.ARBGB;
    this.xml.description = parsed?.abapGit?.["asx:abap"]["asx:values"]?.T100A?.STEXT;

    const t100 = parsed?.abapGit?.["asx:abap"]["asx:values"]?.T100;
    if (t100 === undefined) {
      return;
    }
    for (const msg of xmlToArray(t100.T100)) {
      this.xml!.parsedMessages!.push(new Message(msg.MSGNR, unescape(msg.TEXT), msg.ARBGB));
    }
  }

}