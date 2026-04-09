import { TOKENS } from "src/styles/tokens";

type DropdownProps = {
  children: React.ReactNode;
  value: string;
  onChangeCallback: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

export function Dropdown({ children, value, onChangeCallback }: DropdownProps) {
  return (
    <select
      value={value}
      onChange={onChangeCallback}
      style={{
        fontFamily: "inherit",
        color: TOKENS.INK,
        border: TOKENS.BORDER,
        borderRadius: TOKENS.RADIUS,
        background: "transparent",
        fontSize: "1rem",
      }}
    >
      {children}
    </select>
  );
}
