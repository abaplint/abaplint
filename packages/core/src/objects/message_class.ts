import {AbstractObject} from "./_abstract_object";
import {Message} from "../abap/types/message";
import {xmlToArray, unescape} from "../xml_utils";

export class MessageClass extends AbstractObject {
  private parsedMessages: Message[] | undefined = undefined;

  public getType(): string {
    return "MSAG";
  }

  public getDescription(): string | undefined {
    this.parseXML();
    // todo
    return undefined;
  }

  public getAllowedNaming() {
    return {
      maxLength: 20,
      allowNamespace: true,
    };
  }

  public setDirty(): void {
    this.parsedMessages = undefined;
    super.setDirty();
  }

  public getMessages(): readonly Message[] {
    this.parseXML();
    const msg = this.parsedMessages;
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
    if (this.parsedMessages !== undefined) {
      return;
    }

    this.parsedMessages = [];

    const parsed = super.parseRaw2();
    if (parsed === undefined) {
      return;
    }

    const t100 = parsed?.abapGit?.["asx:abap"]["asx:values"]?.T100;
    if (t100 === undefined) {
      return;
    }
    for (const msg of xmlToArray(t100.T100)) {
      this.parsedMessages.push(new Message(msg.MSGNR, unescape(msg.TEXT)));
    }
  }

}