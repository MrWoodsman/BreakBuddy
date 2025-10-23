// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
// COMPONENTS
import { TimeText } from "./timeText";

export const Timer = ({ totalTime, sessionTime }) => {
  return (
    <AnimatePresence>
      <motion.div className="timersWrap flex flex-col gap-2 items-center justify-center px-4 py-4 border-b-neutral-200 border-b-[1px] text-center">
        <motion.div className="mainTimer" key={1}>
          <h2 className="text-lg">Suma czasu</h2>
          <h1 className="text-3xl">
            <TimeText milliseconds={totalTime} letters />
          </h1>
        </motion.div>
        {totalTime !== sessionTime && (
          <motion.div
            initial={{ y: "-100%", scaleY: 0, opacity: 0 }}
            animate={{ y: 0, scaleY: 1, opacity: 1 }}
            exit={{ y: "-100%", scaleY: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="secondTimer"
            key={2}
          >
            <h4 className="text-sm">Aktualne sesja</h4>
            <h3 className="text-lg">
              <TimeText milliseconds={sessionTime} letters />
            </h3>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
