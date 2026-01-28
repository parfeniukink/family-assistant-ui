import { TOKENS } from "src/styles/tokens";

type DropdownProps = {
  children: React.ReactNode;
  value: string;
  onChangeCallback: (e: any) => void;
};

export function Dropdown({ children, value, onChangeCallback }: DropdownProps) {
  return (
    <select
      value={value}
      onChange={onChangeCallback}
      style={{
        fontFamily: "inherit",
        color: TOKENS.WHITE,
        border: TOKENS.BORDER,
        borderRadius: TOKENS.RADIUS,
        background: "none",
        fontSize: "16px",
      }}
    >
      {children}
    </select>
  );
}
