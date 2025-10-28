export const PageSettings = ({ closeSettings }) => {
    return (
        <div className="page">
            <div className="flex justify-between p-4">
                <button onClick={closeSettings}>X</button>
                <h1 className="text-xl font-bold">Ustawienia</h1>
                <button className="invisible">X</button>
            </div>
            {/* <TitleAndSpace title={"Ogólne"} /> */}
            {/* <SettingsLabel title={"Dark mode"} type={"checkbox"} /> */}
            <SettingsLabel title={"Usuń dane"} type={"button"} />
            <TitleAndSpace title={"Przerwy"} />
            <SettingsLabel title={"Zalecana przerwa"} type={"value"} />
            <SettingsLabel title={"Polecaj ćwiczenia"} type={"checkbox"} />
            <TitleAndSpace title={"Ćwiczenia"} action actionClick />
        </div>
    );
};

const TitleAndSpace = ({ title, action, actionClick }) => {
    return (
        <div className="spacer p-4">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">{title}</h2>
                {action && <button className="flex items-center justify-center rounded-md bg-green-300 w-8 h-8" actionClick={console.log('test')}>
                    <i className="bi bi-plus-circle-fill text-white"></i>
                </button>}
            </div>
            <hr className="mt-1 mx-[-8px] border-neutral-200" />
        </div>
    );
};

const SettingsLabel = ({ type, title, defaultValue, changedValue }) => {
    if (type == "checkbox") {
        return (
            <label className="flex px-4 py-2">
                <h3 className="w-full">{title}</h3>
                <input
                    className="w-8"
                    type="checkbox"
                    name=""
                    id=""
                    checked={defaultValue && changedValue}
                />
            </label>
        );
    }

    if (type == "button") {
        return (
            <label className="flex px-4 py-2">
                <h3 className="w-full">{title}</h3>
                <button>Klik</button>
            </label>
        );
    }

    if (type == "value") {
        return (
            <label className="flex px-4 py-2">
                <h3 className="w-full">{title}</h3>
                <input type="number" name="" id="" value={defaultValue && changedValue} />
            </label>
        );
    }
};
