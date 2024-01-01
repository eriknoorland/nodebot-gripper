# Arduino Gripper
Firmware to manage two servo motors with an Arduino Nano communicating over USB using COBS encoding.

## Packet Descriptions

### Request Packet Format

| Start Flag | Command | Payload Size |
|------------|---------|--------------|
| 1 byte     | 1 byte  | x bytes      |

### Response Packet Format

| Start Flag 1 | Start Flag 2 | Command | Response Data Length | Response |
|--------------|--------------|---------|----------------------|----------|
| `0xA6`       | `0x6A`       | 1 byte  | 1 byte               | x bytes  |

### Requests Overview

| Request        | Value  | Payload                            |
|----------------|--------|------------------------------------|
| IS_READY       | `0x01` | N/A                                |
| SET_JAW_ANGLE  | `0x02` | angle (1 byte), duration (2 bytes) |
| SET_LIFT_ANGLE | `0x03` | angle (1 byte), duration (2 bytes) |

#### Is ready Request
Request: `0xA6` `0x01`

Triggers the ready response to make sure the Arduino is ready for operation.

#### Set Jaw Angle Request
Request `0xA6` `0x02` `0x[angle] 0x[duration 15:8] 0x[duration 7:0]`

Sets the jaw servo to the given angle in the given duration time

#### Set Lift Angle Request
Request `0xA6` `0x03` `0x[angle] 0x[duration 15:8] 0x[duration 7:0`

Sets the jaw servo to the given angle in the given duration time

### Responses Overview

| Request  | Value  | Payload |
|----------|--------|---------|
| IS_READY | `0xFF` | N/A     |

#### Ready Response
**Response:** `0xA6` `0x6A` `0xFF` `0x00`

This response will be sent when the Teensy is ready to be controlled.
