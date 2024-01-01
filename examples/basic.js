const Gripper = require('../index');
const gripper = Gripper('/dev/tty.usbserial-14130');

const jawCloseAngle = 28;
const jawOpenAngle = 125;
const liftUpAngle = 75;
const liftDownAngle = 140;

async function onGripperInitialized() {
  await gripper.setJawAngle(jawOpenAngle);
  await gripper.setLiftAngle(liftDownAngle);

  setTimeout(async () => {
    await gripper.setJawAngle(jawCloseAngle);
    await gripper.setLiftAngle(liftUpAngle);
  }, 250);

  setTimeout(async () => {
    await gripper.setLiftAngle(liftDownAngle);
    await gripper.setJawAngle(jawOpenAngle);
  }, 3000);
};

gripper.init()
  .then(onGripperInitialized);
