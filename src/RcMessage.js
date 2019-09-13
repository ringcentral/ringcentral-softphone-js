import { DOMParser } from 'xmldom'

class RcMessage {
  constructor (Hdr, Bdy) {
    this.Hdr = Hdr
    this.Bdy = Bdy
  }

  static fromXml (xmlStr) {
    if (xmlStr.startsWith('P-rc: ')) {
      xmlStr = xmlStr.substring(6)
    }
    this.xmlStr = xmlStr
    const xmlDoc = new DOMParser().parseFromString(xmlStr, 'text/xml')
    var rcMessage = new RcMessage()
    for (const tag of ['Hdr', 'Bdy']) {
      rcMessage[tag] = {}
      const element = xmlDoc.getElementsByTagName(tag)[0]
      for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i]
        rcMessage[tag][attr.nodeName] = attr.nodeValue
      }
    }
    return rcMessage
  }

  toXml () {
    return '<Msg>' + ['Hdr', 'Bdy'].map(Tag => `<${Tag} ${Object.keys(this[Tag]).map(Attr => `${Attr}="${this[Tag][Attr]}"`).join(' ')}/>`).join('') + '</Msg>'
  }
}

export default RcMessage
