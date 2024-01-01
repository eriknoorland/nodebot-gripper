import EventEmitter from 'events';
import { SerialPort } from 'serialport';
import Parser from './Parser';
import { math } from '@eriknoorland/nodebot-utils';

const cobs = require('cobs');

export default (path: string) => {
  const eventEmitter = new EventEmitter();
  const requestStartFlag = 0xA6;

  let port: SerialPort;
  let parser;

  function init(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (port) {
        setTimeout(reject, 0);
      }

      port = new SerialPort({ path, baudRate: 115200 });
      parser = new Parser();

      port.pipe(parser);

      port.on('error', error => eventEmitter.emit('error', error));
      port.on('disconnect', () => eventEmitter.emit('disconnect'));
      port.on('close', () => eventEmitter.emit('close'));
      port.on('open', onPortOpen);

      parser.on('ready', resolve);
    });
  }

  function isReady() {
    writeToSerialPort([requestStartFlag, 0x01]);

    return Promise.resolve();
  }

  function setJawAngle(angle: number, duration = 500): Promise<void> {
    return new Promise((resolve) => {
      const durationBytes = math.numberToByteArray(duration, 2);

      writeToSerialPort([requestStartFlag, 0x02, angle, ...durationBytes]);
      setTimeout(resolve, duration + 100);
    });
  }

  function setLiftAngle(angle: number, duration = 500): Promise<void> {
    return new Promise((resolve) => {
      const durationBytes = math.numberToByteArray(duration, 2);

      writeToSerialPort([requestStartFlag, 0x03, angle, ...durationBytes]);
      setTimeout(resolve, duration + 100);
    });
  }

  function close(): Promise<void> {
    return new Promise(resolve => {
      port.close(() => {
        resolve();
      });
    });
  }

  function writeToSerialPort(data: number[]) {
    port.write(cobs.encode(Buffer.from(data), true));
  }

  function onPortOpen() {
    port.flush(error => {
      if (error) {
        eventEmitter.emit('error', error);
      }
    });
  }

  return Object.freeze({
    close,
    init,
    isReady,
    setJawAngle,
    setLiftAngle,
    on: eventEmitter.on.bind(eventEmitter),
    off: eventEmitter.off.bind(eventEmitter),
  });
};
