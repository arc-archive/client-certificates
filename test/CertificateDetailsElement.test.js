import { fixture, assert, html, nextFrame } from '@open-wc/testing';
import sinon from 'sinon';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator';
import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
import '@advanced-rest-client/arc-models/client-certificate-model.js';
import { ArcModelEventTypes } from '@advanced-rest-client/arc-events';
import '../certificate-details.js';

/** @typedef {import('../index').CertificateDetailsElement} CertificateDetailsElement */

describe('CertificateDetailsElement', () => {
  const generator = new DataGenerator();

  /**
   * @returns {Promise<CertificateDetailsElement>}
   */
  async function modelFixture() {
    const area = await fixture(html`
      <div>
        <client-certificate-model></client-certificate-model>
        <certificate-details></certificate-details>
      </div>
      `);
    return area.querySelector('certificate-details');
  }

  /**
   * @param {*} certificate
   * @returns {Promise<CertificateDetailsElement>}
   */
  async function dataFixture(certificate) {
    return fixture(html`<certificate-details .certificate="${certificate}"></certificate-details>`);
  }

  describe('Querying for the certificate', () => {
    let id;

    before(async () => {
      const [insert] = await generator.insertCertificatesData({
        size: 1
      });
      id = insert._id;
    });

    after(async () => {
      await generator.destroyClientCertificates();
    });

    let element = /** @type CertificateDetailsElement */ (null);
    beforeEach(async () => {
      element = await modelFixture();
    });

    it('queryCertInfo sets certificate data', async () => {
      await element.queryCertInfo(id);
      assert.typeOf(element.certificate, 'object', 'certificate is set');
    });

    it('resets certificate on error', async () => {
      // @ts-ignore
      element.certificate = {};
      await element.queryCertInfo('non-existing');
      assert.isUndefined(element.certificate);
    });

    it('resets querying flag', async () => {
      await element.queryCertInfo(id);
      assert.isFalse(element.querying);
    });

    it('queries for data when certId attribute is set', async () => {
      let event;
      element.addEventListener(ArcModelEventTypes.ClientCertificate.read, (e) => { event = e; });
      element.certId = id;
      // @ts-ignore
      const cert = await event.detail.result;
      await nextFrame();
      assert.deepEqual(element.certificate, cert, 'certificate is set');
    });
  });

  describe('Data rendering', () => {
    it('renders title', async () => {
      const item = generator.generateClientCertificate();
      const element = await dataFixture(item);
      const header = element.shadowRoot.querySelector('h2');
      assert.dom.equal(header, `<h2>${item.name}</h2>`);
    });

    it('renders time', async () => {
      const item = generator.generateClientCertificate();
      const element = await dataFixture(item);
      const dt = element.shadowRoot.querySelector('date-time');
      assert.ok(dt, 'date-time element is rendered');
      assert.equal(dt.date, item.created, 'element has timestamp value');
    });

    it('renders type', async () => {
      const item = generator.generateClientCertificate();
      const element = await dataFixture(item);
      const dt = element.shadowRoot.querySelector('.meta-row[data-type="type"] .value');
      assert.ok(dt, 'type is rendered');
      assert.equal(dt.textContent.trim(), item.type, 'type has value');
    });

    it('renders files info for p12', async () => {
      const item = generator.generateClientCertificate();
      item.type = 'p12';
      delete item.key;
      const element = await dataFixture(item);
      const dt = element.shadowRoot.querySelector('.meta-row[data-type="files"] .value');
      assert.ok(dt, 'type is rendered');
      assert.equal(dt.textContent.trim(), 'Certificate', 'has "Certificate"');
    });

    it('renders files info for pem', async () => {
      const item = generator.generateClientCertificate();
      item.type = 'pem';
      item.key = item.cert;
      const element = await dataFixture(item);
      const dt = element.shadowRoot.querySelector('.meta-row[data-type="files"] .value');
      assert.ok(dt, 'type is rendered');
      assert.equal(dt.textContent.trim(), 'Certificate, Key', 'has "Certificate, Key"');
    });
  });

  describe('Delete action', () => {
    let element = /** @type CertificateDetailsElement */ (null);
    beforeEach(async () => {
      const item = generator.generateClientCertificate();
      element = await dataFixture(item);
      element.queryCertInfo = async () => {};
      element.certId = 'test123';
    });

    it('dispatches delete event when button click', () => {
      const spy = sinon.spy();
      element.addEventListener(ArcModelEventTypes.ClientCertificate.delete, spy);
      const button = element.shadowRoot.querySelector('anypoint-button[data-action="delete-certificate"]');
      MockInteractions.tap(button);
      assert.isTrue(spy.called);
    });
  });
});
