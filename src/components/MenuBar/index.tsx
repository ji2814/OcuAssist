import AppInfo from "./AppInfo";
import PatientInfo from "./PatientInfo";
import Tools from "./Tools";

const MenuBar = () => {
  console.log("MenuBar");
  
  return (
    <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-blue-800 text-white shadow-lg">
      <div className="px-6 py-4 flex justify-between items-center">
        {/* 左侧：应用信息 - 使用玻璃态效果 */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
          <AppInfo />
        </div>
        
        {/* 中间：患者信息 - 使用卡片式设计 */}
        <div className="bg-white/15 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/30 shadow-md">
          <PatientInfo />
        </div>
        
        {/* 右侧：工具栏 - 使用按钮组设计 */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
          <Tools />
        </div>
      </div>
    </div>
  );

};

export default MenuBar;
