#include "Servo.h"
#include "PacketSerial.h"
#include "Ramp.h"

const byte REQUEST_START_FLAG = 0xA6;
const byte REQUEST_IS_READY = 0x01;
const byte REQUEST_JAW_ANGLE = 0x02;
const byte REQUEST_LIFT_ANGLE = 0x03;

const byte RESPONSE_START_FLAG_1 = 0xA6;
const byte RESPONSE_START_FLAG_2 = 0x6A;
const byte RESPONSE_READY = 0xFF;

const int JAW_SERVO_PIN = 7;
const int LIFT_SERVO_PIN = 8;

PacketSerial serial;

Servo jaw;
Servo lift;

rampInt jawRamp;
rampInt liftRamp;

int lastJawAngle = 90;
int lastLiftAngle = 90;

bool isReady = false;

/**
 * Send the identifier response
 */
void responseIdentifier() {
  uint8_t identifierResponse[7] = { 0x67, 0x72, 0x69, 0x70, 0x70, 0x65, 0x72 }; // spells 'gripper'

  serial.send(identifierResponse, sizeof(identifierResponse));
}

/**
 * Send the ready response
 */
void responseReady() {
  uint8_t readyResponse[4] = {
    RESPONSE_START_FLAG_1,
    RESPONSE_START_FLAG_2,
    RESPONSE_READY,
    0x00
  };

  serial.send(readyResponse, sizeof(readyResponse));
  isReady = true;
}

/**
 * Serial packet received event handler
 * @param {uint8_t} buffer
 * @param {size_t} size
 */
void onPacketReceived(const uint8_t* buffer, size_t size) {
  byte startFlag = buffer[0];
  byte command = buffer[1];

  if (startFlag == REQUEST_START_FLAG) {
    switch (command) {

      case REQUEST_JAW_ANGLE: {
        int jawAngle = constrain(buffer[2], 0, 180);
        int jawDuration = (buffer[3] << 8) + buffer[4];

        jawRamp.go(jawAngle, jawDuration, LINEAR);
        break;
      }

      case REQUEST_LIFT_ANGLE: {
        int liftAngle = constrain(buffer[2], 0, 180);
        int liftDuration = (buffer[3] << 8) + buffer[4];

        liftRamp.go(liftAngle, liftDuration, LINEAR);
        break;
      }

      case REQUEST_IS_READY: {
        responseReady();
        break;
      }
    }
  } else if (startFlag == 0xAA && command == 0xAA && buffer[2] == 0xAA && buffer[3] == 0xAA) {
    responseIdentifier();
  }
}

/**
 * Setup
 */
void setup() {
  Serial.begin(115200);

  serial.setStream(&Serial);
  serial.setPacketHandler(&onPacketReceived);

  jaw.attach(JAW_SERVO_PIN);
  lift.attach(LIFT_SERVO_PIN);

  jawRamp.go(90);
  liftRamp.go(90);

  while (!Serial) {}
}

/**
 * Loop
 */
void loop() {
  serial.update();

  if (!isReady) {
    return;
  }

  int liftAngle = liftRamp.update();
  int jawAngle = jawRamp.update();

  if (liftAngle != lastLiftAngle) {
    lift.write(liftAngle);
  }

  if (jawAngle != lastJawAngle) {
    jaw.write(jawAngle);
  }

  lastJawAngle = jawAngle;
  lastLiftAngle = liftAngle;
}
