const EventEmitter = require('events');
const SerialPort = require('serialport');
const cobs = require('cobs');
const Parser = require('./Parser');
const numberToByteArray = require('./utils/numberToByteArray');

/**
 * Gripper
 * @param {String} path
 * @return {Object}
 */
const gripper = (path) => {
  const eventEmitter = new EventEmitter();
  const requestStartFlag = 0xA6;

  let port;
  let parser;

  /**
   * Init
   * @return {Promise}
   */
  function init() {
    return new Promise((resolve, reject) => {
      if (port) {
        setTimeout(reject, 0);
      }

      port = new SerialPort(path, { baudRate: 115200 });
      parser = new Parser();

      port.pipe(parser);

      port.on('error', error => eventEmitter.emit('error', error));
      port.on('disconnect', () => eventEmitter.emit('disconnect'));
      port.on('close', () => eventEmitter.emit('close'));
      port.on('open', onPortOpen);

      parser.on('ready', resolve);
    });
  }

  /**
   * Ask controller for ready response
   * @return {Promise}
   */
  function isReady() {
    writeToSerialPort([requestStartFlag, 0x01]);

    return Promise.resolve();
  }

  /**
   *
   * @param {Number} angle
   * @param {Number} duration
   * @return {Promise}
   */
  function setJawAngle(angle, duration = 500) {
    return new Promise((resolve) => {
      const durationBytes = numberToByteArray(duration, 2);

      writeToSerialPort([requestStartFlag, 0x02, angle, ...durationBytes]);
      setTimeout(resolve, duration + 100);
    });
  }

  /**
   *
   * @param {Number} angle
   * @param {Number} duration
   * @return {Promise}
   */
  function setLiftAngle(angle, duration = 500) {
    return new Promise((resolve) => {
      const durationBytes = numberToByteArray(duration, 2);

      writeToSerialPort([requestStartFlag, 0x03, angle, ...durationBytes]);
      setTimeout(resolve, duration + 100);
    });
  }

  /**
   * Closes the serial connection
   * @returns {Promise}
   */
  function close() {
    return new Promise(resolve => {
      port.close(error => {
        resolve();
      });
    });
  }

  function writeToSerialPort(data) {
    port.write(cobs.encode(Buffer.from(data), true));
  }

  function onPortOpen() {
    port.flush(error => {
      if (error) {
        eventEmitter.emit('error', error);
      }
    });
  }

  return {
    close,
    init,
    isReady,
    setJawAngle,
    setLiftAngle,
    on: eventEmitter.on.bind(eventEmitter),
    off: eventEmitter.off.bind(eventEmitter),
  };
};

module.exports = gripper;
