import { NextPage } from "next";
import { MdArrowDropDownCircle } from "react-icons/md";
import { useTheme } from "next-themes";

const _ThemeSelector: NextPage = () => {
  const { setTheme } = useTheme();

  return (
    <div className="dropdown">
      <label tabIndex={0} className="btn m-1">
        Theme <MdArrowDropDownCircle className="ml-2" />
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-32 h-52 md:w-52 md:h-52 overflow-y-scroll overflow-x-hidden"
      >
        <li>
          <a onClick={() => setTheme("light")}>Light Mode</a>
        </li>
        <li>
          <a onClick={() => setTheme("dark")}>Dark Mode</a>
        </li>
        <li>
          <a onClick={() => setTheme("cupcake")}>Cupcake</a>
        </li>
        <li>
          <a onClick={() => setTheme("bumblebee")}>Bumblebee</a>
        </li>
        <li>
          <a onClick={() => setTheme("emerald")}>Emerald</a>
        </li>
        <li>
          <a onClick={() => setTheme("corporate")}>Corporate</a>
        </li>
        <li>
          <a onClick={() => setTheme("synthwave")}>Synthwave</a>
        </li>
        <li>
          <a onClick={() => setTheme("retro")}>Retro</a>
        </li>
        <li>
          <a onClick={() => setTheme("cyberpunk")}>Cyberpunk</a>
        </li>
        <li>
          <a onClick={() => setTheme("valentine")}>Valentine</a>
        </li>
        <li>
          <a onClick={() => setTheme("halloween")}>Halloween</a>
        </li>
        <li>
          <a onClick={() => setTheme("garden")}>Garden</a>
        </li>
        <li>
          <a onClick={() => setTheme("forest")}>Forest</a>
        </li>
        <li>
          <a onClick={() => setTheme("aqua")}>Aqua</a>
        </li>
        <li>
          <a onClick={() => setTheme("lofi")}>Lofi</a>
        </li>
        <li>
          <a onClick={() => setTheme("pastel")}>Pastel</a>
        </li>
        <li>
          <a onClick={() => setTheme("fantasy")}>Fantasy</a>
        </li>
        <li>
          <a onClick={() => setTheme("wireframe")}>Wireframe</a>
        </li>
        <li>
          <a onClick={() => setTheme("black")}>Black</a>
        </li>
        <li>
          <a onClick={() => setTheme("luxury")}>Luxury</a>
        </li>
        <li>
          <a onClick={() => setTheme("dracula")}>Dracula</a>
        </li>
        <li>
          <a onClick={() => setTheme("cmyk")}>Cmyk</a>
        </li>
        <li>
          <a onClick={() => setTheme("autumn")}>Autumn</a>
        </li>
        <li>
          <a onClick={() => setTheme("business")}>Business</a>
        </li>
        <li>
          <a onClick={() => setTheme("acid")}>Acid</a>
        </li>
        <li>
          <a onClick={() => setTheme("lemonade")}>Lemonade</a>
        </li>
        <li>
          <a onClick={() => setTheme("night")}>Night</a>
        </li>
        <li>
          <a onClick={() => setTheme("coffee")}>Coffee</a>
        </li>
        <li>
          <a onClick={() => setTheme("winter")}>Winter</a>
        </li>
      </ul>
    </div>
  );
};

export default _ThemeSelector;
