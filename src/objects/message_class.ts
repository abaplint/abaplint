import {AbstractObject} from "./_abstract_object";
import {Message} from "../abap/types/message";
import {xmlToArray} from "../xml_utils";

export class MessageClass extends AbstractObject {

  public getType(): string {
    return "MSAG";
  }

  public getAllowedNaming() {
    return {
      maxLength: 20,
      allowNamespace: true,
    };
  }

  public getMessages(): Message[] {
    const xml = this.getXML();
    if (xml === undefined) {
      return [];
    }
    const parsed = this.parseXML();

    return this.parse(parsed);
  }

  private parse(data: any): Message[] {
    const ret: Message[] = [];

    const t100 = data.abapGit["asx:abap"]["asx:values"].T100;
    for (const msg of xmlToArray(t100.T100)) {
      ret.push(new Message(msg.MSGNR._text, msg.TEXT ? msg.TEXT._text : ""));
    }

    return ret;
  }

  public getByNumber(num: string): Message | undefined {
    for (const message of this.getMessages()) {
      if (message.getNumber() === num) {
        return message;
      }
    }
    return undefined;
  }

}