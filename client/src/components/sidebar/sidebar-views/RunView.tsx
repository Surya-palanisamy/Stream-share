import { useState } from "react";
import { useRunCode } from "@/context/RunCodeContext";
import useResponsive from "@/hooks/useResponsive";
import { ChangeEvent } from "react";
import toast from "react-hot-toast";
import { LuCopy } from "react-icons/lu";
import { PiCaretDownBold } from "react-icons/pi";

function RunView() {
    const { viewHeight } = useResponsive();
    const {
        output,
        isRunning,
        supportedLanguages,
        selectedLanguage,
        setSelectedLanguage,
        runCode,
    } = useRunCode();

    // State to manage caret toggle
    const [isSelectOpen, setIsSelectOpen] = useState(false);

    const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const lang = JSON.parse(e.target.value);
        setSelectedLanguage(lang);
        // Close the select dropdown after selection
        setIsSelectOpen(false);
    };

    const toggleSelect = () => {
        setIsSelectOpen(!isSelectOpen);
    };

    const copyOutput = () => {
        navigator.clipboard.writeText(output);
        toast.success("Output copied to clipboard");
    };

    return (
        <div
            className="flex flex-col items-center gap-2 p-4"
            style={{ height: viewHeight }}
        >
            <h1 className="view-title">Run Code</h1>
            <div className="flex h-[90%] w-full flex-col items-end gap-2 md:h-[92%]">
                <div className="relative w-full">
                    <select
                        className="w-full appearance-none rounded-md border-none bg-darkHover px-4 py-2 text-white outline-none"
                        value={JSON.stringify(selectedLanguage)}
                        onChange={handleLanguageChange}
                        onClick={toggleSelect}
                    >
                        {supportedLanguages
                            .sort((a, b) => (a.language > b.language ? 1 : -1))
                            .map((lang, i) => {
                                return (
                                    <option
                                        key={i}
                                        value={JSON.stringify(lang)}
                                    >
                                        {lang.language +
                                            (lang.version
                                                ? ` (${lang.version})`
                                                : "")}
                                    </option>
                                );
                            })}
                    </select>
                    <PiCaretDownBold
                        size={16}
                        className={`absolute bottom-3 right-4 z-10 text-white transition-transform duration-300 ${
                            isSelectOpen ? "rotate-180" : ""
                        }`}
                    />
                </div>

                <button
                    className="flex w-full justify-center rounded-md bg-orange-600 p-2 font-bold text-white outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={runCode}
                    disabled={isRunning}
                >
                    Run
                </button>
                <label className="flex w-full justify-between">
                    Output :
                    <button onClick={copyOutput} title="Copy Output">
                        <LuCopy
                            size={19}
                            className="cursor-pointer text-white"
                        />
                    </button>
                </label>
                <div className="w-full flex-grow resize-none overflow-y-auto rounded-md border-none bg-darkHover p-2 text-white outline-none">
                    <code>
                        <pre className="text-wrap">{output}</pre>
                    </code>
                </div>
            </div>
        </div>
    );
}

export default RunView;
