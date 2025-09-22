

const AppInfo = () => {
    const appName = "OcuAssist";
    const logoUrl = "src/assets/seu-logo.svg";

    {/* 左侧区域：软件名称和LOGO */ }
    return (
        <div className="flex items-center gap-4">
            {logoUrl && (
                <div className="relative">
                    <img
                        src={logoUrl}
                        alt="App Logo"
                        className="h-10 w-10 object-contain drop-shadow-lg"
                    />
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20 blur-sm"></div>
                </div>
            )}
            <div className="flex flex-col">
                <span className="text-white font-bold text-xl tracking-wide drop-shadow-md">
                    {appName}
                </span>
                <span className="text-blue-200 text-xs font-medium">
                    眼科辅助诊断系统
                </span>
            </div>
        </div>
    )
};

export default AppInfo;
