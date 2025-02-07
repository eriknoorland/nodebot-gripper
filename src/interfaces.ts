export type GripperEvents = {
  'error': Error[]
  'disconnect': []
  'close': []
}

type EventName = keyof GripperEvents
type EventHandler = (...eventArg: GripperEvents[EventName]) => void

export interface Gripper {
  close: () => Promise<void>
  init: () => Promise<void>
  isReady: () => Promise<void>
  setJawAngle: (angle: number, duration: number) => Promise<void>
  setLiftAngle: (angle: number, duration: number) => Promise<void>
  on: (eventName: EventName, handler: EventHandler) => void
  off: (eventName: EventName, handler: EventHandler) => void
}