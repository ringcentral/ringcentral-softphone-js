import {DOMParser} from 'xmldom';

type HDR = {
  [key: string]: string | null;
};
type BDY = {
  [key: string]: string | null;
};

class RcMessage {
  Hdr: HDR;
  Bdy: BDY;
  [key: string]: HDR | BDY | Function;

  constructor(Hdr: HDR, Bdy: BDY) {
    this.Hdr = Hdr;
    this.Bdy = Bdy;
  }

  static fromXml(xmlStr: string) {
    if (xmlStr.startsWith('P-rc: ')) {
      xmlStr = xmlStr.substring(6);
    }
    const xmlDoc = new DOMParser().parseFromString(xmlStr, 'text/xml');
    const rcMessage = new RcMessage({}, {});
    for (const tag of ['Hdr', 'Bdy']) {
      rcMessage[tag] = {};
      const element = xmlDoc.getElementsByTagName(tag)[0];
      for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
        (rcMessage[tag] as HDR | BDY)[attr.nodeName] = attr.nodeValue;
      }
    }
    return rcMessage;
  }

  toXml() {
    return (
      '<Msg>' +
      ['Hdr', 'Bdy']
        .map(
          Tag =>
            `<${Tag} ${Object.keys(this[Tag])
              .map(Attr => `${Attr}="${(this[Tag] as HDR | BDY)[Attr]}"`)
              .join(' ')}/>`
        )
        .join('') +
      '</Msg>'
    );
  }
}

export default RcMessage;
