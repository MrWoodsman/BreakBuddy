import { TimeText } from "./timeText";

export const Timer = () => {
  return (
    <div className="timersWrap flex flex-col gap-4 items-center justify-center px-4 py-8 border-b-neutral-200 border-b-[1px] text-center">
      <div className="mainTimer">
        <h2 className="text-lg">Suma czasu</h2>
        <h1 className="text-3xl">
          <TimeText milliseconds={5529000} lethers />
        </h1>
      </div>
      <div className="secondTimer">
        <h4 className="text-base">Suma czasu</h4>
        <h3 className="text-xl">
          <TimeText milliseconds={3529000} lethers />
        </h3>
      </div>
    </div>
  );
};
